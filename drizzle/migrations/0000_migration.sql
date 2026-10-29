
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.testimonial_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.subscription_status AS ENUM ('free','pending','active','past_due','canceled','expired');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text CHECK (char_length(display_name) <= 100),
  preferred_language text NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','fr')),
  is_disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profile select own or admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profile update own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Prevent users from toggling is_disabled themselves
CREATE OR REPLACE FUNCTION public.protect_profile_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_disabled IS DISTINCT FROM OLD.is_disabled AND current_user = 'authenticated' THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Plans (configurable)
CREATE TABLE public.plans (
  code text PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  max_projects integer NOT NULL CHECK (max_projects >= 0),
  max_testimonials integer NOT NULL CHECK (max_testimonials >= 0),
  max_published integer NOT NULL CHECK (max_published >= 0),
  custom_branding boolean NOT NULL DEFAULT false,
  csv_export boolean NOT NULL DEFAULT false,
  analytics_level text NOT NULL DEFAULT 'simple',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT UPDATE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plans admin update" ON public.plans FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.plans (code,name,price_cents,max_projects,max_testimonials,max_published,custom_branding,csv_export,analytics_level,sort_order) VALUES
 ('free','Free',0,1,100,10,false,false,'simple',1),
 ('starter','Starter',900,3,500,500,true,true,'basic',2),
 ('pro','Pro',1900,10,2000,2000,true,true,'advanced',3);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_code text NOT NULL DEFAULT 'free' REFERENCES public.plans(code),
  status public.subscription_status NOT NULL DEFAULT 'free',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs own or admin read" ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Effective plan: paid plan only counts when status active (or past_due grace)
CREATE OR REPLACE FUNCTION public.effective_plan(_user uuid) RETURNS public.plans
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.* FROM public.plans p
  WHERE p.code = COALESCE((
    SELECT s.plan_code FROM public.subscriptions s
    WHERE s.user_id = _user AND s.status IN ('active','past_due')
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ), 'free')
$$;

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text CHECK (char_length(description) <= 500),
  logo_url text CHECK (char_length(logo_url) <= 500),
  website_url text CHECK (char_length(website_url) <= 300),
  primary_color text NOT NULL DEFAULT '#5B21B6' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  public_slug text NOT NULL UNIQUE CHECK (public_slug ~ '^[a-z0-9][a-z0-9-]{2,48}$'),
  is_public boolean NOT NULL DEFAULT true,
  show_branding boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_owner_idx ON public.projects(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
CREATE INDEX project_members_user_idx ON public.project_members(user_id);
GRANT SELECT ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_project(_project uuid, _user uuid, _write boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project AND owner_id = _user)
    OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = _project AND user_id = _user
               AND (NOT _write OR role IN ('owner','editor')))
$$;

CREATE POLICY "members read own" ON public.project_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));

CREATE POLICY "projects read" ON public.projects FOR SELECT TO authenticated USING (public.can_access_project(id, auth.uid()));
CREATE POLICY "projects insert own" ON public.projects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "projects update" ON public.projects FOR UPDATE TO authenticated
  USING (public.can_access_project(id, auth.uid(), true)) WITH CHECK (public.can_access_project(id, auth.uid(), true));
CREATE POLICY "projects delete owner" ON public.projects FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Project limit + immutable owner
CREATE OR REPLACE FUNCTION public.enforce_project_rules() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim integer; cnt integer; disabled boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT is_disabled INTO disabled FROM public.profiles WHERE id = NEW.owner_id;
    IF disabled THEN RAISE EXCEPTION 'ACCOUNT_DISABLED'; END IF;
    SELECT max_projects INTO lim FROM public.effective_plan(NEW.owner_id);
    SELECT count(*) INTO cnt FROM public.projects WHERE owner_id = NEW.owner_id;
    IF cnt >= lim THEN RAISE EXCEPTION 'PLAN_LIMIT_PROJECTS'; END IF;
  ELSE
    NEW.owner_id := OLD.owner_id;
    NEW.updated_at := now();
  END IF;
  IF NOT (SELECT custom_branding FROM public.effective_plan(NEW.owner_id)) THEN
    NEW.show_branding := true;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER projects_rules BEFORE INSERT OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.enforce_project_rules();

-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  contact_email text CHECK (contact_email IS NULL OR (char_length(contact_email) <= 255 AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  company_name text CHECK (char_length(company_name) <= 100),
  website_url text CHECK (char_length(website_url) <= 300),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL CHECK (char_length(content) BETWEEN 10 AND 2000),
  photo_url text CHECK (char_length(photo_url) <= 500),
  consent_to_publish boolean NOT NULL DEFAULT false,
  status public.testimonial_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX testimonials_project_status_idx ON public.testimonials(project_id, status, submitted_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials read" ON public.testimonials FOR SELECT TO authenticated USING (public.can_access_project(project_id, auth.uid()));
CREATE POLICY "testimonials update" ON public.testimonials FOR UPDATE TO authenticated
  USING (public.can_access_project(project_id, auth.uid(), true)) WITH CHECK (public.can_access_project(project_id, auth.uid(), true));
CREATE POLICY "testimonials delete" ON public.testimonials FOR DELETE TO authenticated USING (public.can_access_project(project_id, auth.uid(), true));

CREATE OR REPLACE FUNCTION public.enforce_testimonial_rules() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid; lim integer; cnt integer;
BEGIN
  NEW.project_id := OLD.project_id;
  NEW.consent_to_publish := OLD.consent_to_publish;
  NEW.contact_email := OLD.contact_email;
  NEW.submitted_at := OLD.submitted_at;
  NEW.updated_at := now();
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    IF NOT NEW.consent_to_publish THEN RAISE EXCEPTION 'NO_CONSENT'; END IF;
    SELECT owner_id INTO owner FROM public.projects WHERE id = NEW.project_id;
    SELECT max_published INTO lim FROM public.effective_plan(owner);
    SELECT count(*) INTO cnt FROM public.testimonials t JOIN public.projects p ON p.id = t.project_id
      WHERE p.owner_id = owner AND t.status = 'approved';
    IF cnt >= lim THEN RAISE EXCEPTION 'PLAN_LIMIT_PUBLISHED'; END IF;
    NEW.approved_at := now();
  ELSIF NEW.status <> 'approved' THEN
    NEW.approved_at := NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER testimonials_rules BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.enforce_testimonial_rules();

-- Payment events (server only; admin read)
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text,
  event_type text NOT NULL,
  user_id uuid,
  processing_status text NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received','processed','ignored','failed')),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);
GRANT SELECT ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment events admin" ON public.payment_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Usage events
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('page_view','widget_view','submission')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX usage_events_project_idx ON public.usage_events(project_id, event_type, created_at);
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage read own projects" ON public.usage_events FOR SELECT TO authenticated
  USING (public.can_access_project(project_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- Audit logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Signup: profile + free subscription
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_language)
  VALUES (NEW.id, LEFT(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),100),
          CASE WHEN NEW.raw_user_meta_data->>'preferred_language' = 'fr' THEN 'fr' ELSE 'en' END);
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PUBLIC RPCs ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_collect_project(_slug text)
RETURNS TABLE (name text, logo_url text, primary_color text, description text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.name, p.logo_url, p.primary_color, p.description FROM public.projects p
  JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.public_slug = _slug AND NOT pr.is_disabled
$$;

CREATE OR REPLACE FUNCTION public.submit_testimonial(
  _slug text, _display_name text, _email text, _company text, _website text,
  _rating int, _content text, _consent boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE proj public.projects; recent int; total int; lim int; new_id uuid;
BEGIN
  SELECT p.* INTO proj FROM public.projects p JOIN public.profiles pr ON pr.id = p.owner_id
    WHERE p.public_slug = _slug AND NOT pr.is_disabled;
  IF proj.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF NOT _consent THEN RAISE EXCEPTION 'CONSENT_REQUIRED'; END IF;
  SELECT count(*) INTO recent FROM public.testimonials WHERE project_id = proj.id AND submitted_at > now() - interval '10 minutes';
  IF recent >= 15 THEN RAISE EXCEPTION 'RATE_LIMITED'; END IF;
  SELECT max_testimonials INTO lim FROM public.effective_plan(proj.owner_id);
  SELECT count(*) INTO total FROM public.testimonials t JOIN public.projects p ON p.id = t.project_id WHERE p.owner_id = proj.owner_id;
  IF total >= lim THEN RAISE EXCEPTION 'PLAN_LIMIT_TESTIMONIALS'; END IF;
  INSERT INTO public.testimonials (project_id, display_name, contact_email, company_name, website_url, rating, content, consent_to_publish)
  VALUES (proj.id, trim(_display_name), NULLIF(trim(_email),''), NULLIF(trim(_company),''), NULLIF(trim(_website),''), _rating, trim(_content), true)
  RETURNING id INTO new_id;
  INSERT INTO public.usage_events (user_id, project_id, event_type) VALUES (proj.owner_id, proj.id, 'submission');
  RETURN new_id;
END $$;

CREATE OR REPLACE FUNCTION public.get_public_page(_slug text, _limit int DEFAULT 12, _offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE proj public.projects; result jsonb;
BEGIN
  SELECT p.* INTO proj FROM public.projects p JOIN public.profiles pr ON pr.id = p.owner_id
    WHERE p.public_slug = _slug AND p.is_public AND NOT pr.is_disabled;
  IF proj.id IS NULL THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'project', jsonb_build_object('name',proj.name,'description',proj.description,'logo_url',proj.logo_url,
       'primary_color',proj.primary_color,'website_url',proj.website_url,'show_branding',proj.show_branding,'slug',proj.public_slug),
    'stats', (SELECT jsonb_build_object('count',count(*),'average',COALESCE(round(avg(rating)::numeric,1),0))
              FROM public.testimonials WHERE project_id = proj.id AND status='approved' AND consent_to_publish),
    'items', COALESCE((SELECT jsonb_agg(x) FROM (
       SELECT id, display_name, company_name, rating, content, photo_url, approved_at
       FROM public.testimonials WHERE project_id = proj.id AND status='approved' AND consent_to_publish
       ORDER BY approved_at DESC LIMIT LEAST(GREATEST(_limit,1),50) OFFSET GREATEST(_offset,0)) x), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.record_view(_slug text, _kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE proj public.projects;
BEGIN
  IF _kind NOT IN ('page_view','widget_view') THEN RETURN; END IF;
  SELECT * INTO proj FROM public.projects WHERE public_slug = _slug AND is_public;
  IF proj.id IS NULL THEN RETURN; END IF;
  INSERT INTO public.usage_events (user_id, project_id, event_type) VALUES (proj.owner_id, proj.id, _kind);
END $$;

REVOKE ALL ON FUNCTION public.submit_testimonial(text,text,text,text,text,int,text,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_page(text,int,int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_collect_project(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_view(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_testimonial(text,text,text,text,text,int,text,boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_page(text,int,int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_collect_project(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_view(text,text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.effective_plan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.effective_plan(uuid) TO authenticated, service_role;
