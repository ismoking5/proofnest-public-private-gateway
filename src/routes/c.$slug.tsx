import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LogoMark } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { getCollectProject, submitTestimonial } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$slug")({
  loader: async ({ params }) => {
    if (!/^[a-z0-9][a-z0-9-]{2,48}$/.test(params.slug)) throw notFound();
    const project = await getCollectProject({ data: { slug: params.slug } });
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Share your experience with ${loaderData.project.name}` : "Leave a testimonial — ProofNest" },
      { name: "description", content: "Leave a short testimonial. It takes less than a minute." },
      { property: "og:title", content: loaderData ? `Share your experience with ${loaderData.project.name}` : "Leave a testimonial" },
      { property: "og:description", content: "Leave a short testimonial. It takes less than a minute." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => <CenterMsg k="collect.notFound" />,
  component: Collect,
});

function CenterMsg({ k }: { k: string }) {
  const { t } = useI18n();
  return <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">{t(k)}</div>;
}

function Collect() {
  const { project } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const [startedAt] = useState(() => Date.now());
  const [f, setF] = useState({ display_name: "", email: "", company: "", website: "", content: "", hp: "" });
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setBusy(true);
    setErr(null);
    try {
      const website = f.website && !/^https?:\/\//.test(f.website) ? `https://${f.website}` : f.website;
      const r = await submitTestimonial({ data: { slug, ...f, website, rating, consent: true, startedAt } });
      if (r.ok) setDone(true);
      else setErr(r.code === "RATE_LIMITED" ? t("collect.rateLimited") : r.code === "PLAN_LIMIT_TESTIMONIALS" ? t("collect.limit") : t("common.error"));
    } catch {
      setErr(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex justify-end"><LanguageSwitcher /></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8" style={{ borderTop: `4px solid ${project.primary_color}` }}>
          {project.logo_url ? <img src={project.logo_url} alt={project.name} className="mb-4 h-12 w-auto object-contain" /> : null}
          {done ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h1 className="mt-4 text-2xl font-bold">{t("collect.thanks")}</h1>
              <p className="mt-2 text-muted-foreground">{t("collect.thanksSub")}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{t("collect.title", { name: project.name })}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("collect.sub")}</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <Label>{t("collect.rating")}</Label>
                  <div className="mt-1.5 flex gap-1" role="radiogroup">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i}`} onClick={() => setRating(i)} className="p-0.5">
                        <Star className={cn("h-8 w-8 transition-transform hover:scale-110", i <= rating ? "fill-star text-star" : "text-border")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="content">{t("collect.content")}</Label><Textarea id="content" required minLength={10} maxLength={2000} rows={5} placeholder={t("collect.contentPh")} value={f.content} onChange={set("content")} /></div>
                <div className="space-y-1.5"><Label htmlFor="dn">{t("collect.name")}</Label><Input id="dn" required maxLength={80} value={f.display_name} onChange={set("display_name")} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="co">{t("collect.company")} <span className="text-muted-foreground">({t("common.optional")})</span></Label><Input id="co" maxLength={100} value={f.company} onChange={set("company")} /></div>
                  <div className="space-y-1.5"><Label htmlFor="em">{t("collect.email")} <span className="text-muted-foreground">({t("common.optional")})</span></Label><Input id="em" type="email" maxLength={255} value={f.email} onChange={set("email")} /></div>
                </div>
                <p className="-mt-2 text-xs text-muted-foreground">{t("collect.emailHelp")}</p>
                <div className="space-y-1.5"><Label htmlFor="ws">{t("collect.website")} <span className="text-muted-foreground">({t("common.optional")})</span></Label><Input id="ws" maxLength={300} value={f.website} onChange={set("website")} /></div>
                <input type="text" name="company_url" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} className="hidden" aria-hidden />
                <label className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm">
                  <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" required />
                  <span>{t("collect.consent", { name: project.name })}</span>
                </label>
                {err && <p className="text-sm text-destructive">{err}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={busy || !consent}>{busy ? t("common.loading") : t("collect.submit")}</Button>
              </form>
            </>
          )}
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><LogoMark className="h-4 w-4" /> {t("public.poweredBy")}</p>
      </div>
    </div>
  );
}
