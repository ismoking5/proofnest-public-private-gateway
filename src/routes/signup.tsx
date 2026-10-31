import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, SocialButtons } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [
    { title: "Create your free account — ProofNest" }, { name: "description", content: "Start collecting customer testimonials for free." },
    { property: "og:title", content: "Start free — ProofNest" }, { property: "og:description", content: "Start collecting customer testimonials for free." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Signup,
});

function Signup() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error(t("auth.passwordMin")); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { display_name: name.trim().slice(0, 100), preferred_language: locale } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  if (sent)
    return (
      <AuthShell title={t("auth.signupTitle")}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p>{t("auth.checkEmail")}</p>
          <Button asChild variant="outline" className="mt-2"><Link to="/login">{t("auth.login")}</Link></Button>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell title={t("auth.signupTitle")} subtitle={t("auth.signupSub")}>
      <SocialButtons />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="name">{t("auth.name")}</Label><Input id="name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">{t("auth.password")}</Label><Input id="pw" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /><p className="text-xs text-muted-foreground">{t("auth.passwordMin")}</p></div>
        <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy ? t("common.loading") : t("auth.signup")}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">{t("auth.haveAccount")} <Link to="/login" className="font-medium text-primary hover:underline">{t("auth.login")}</Link></p>
    </AuthShell>
  );
}
