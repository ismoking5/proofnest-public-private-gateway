import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell, SocialButtons } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Log in — ProofNest" }, { name: "description", content: "Log in to your ProofNest account." },
    { property: "og:title", content: "Log in — ProofNest" }, { property: "og:description", content: "Log in to your ProofNest account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Login,
});

function Login() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message.includes("confirm") ? t("auth.checkEmail") : t("auth.invalid"));
  };

  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSub")}>
      <SocialButtons />
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><Label htmlFor="pw">{t("auth.password")}</Label><Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("auth.forgot")}</Link></div>
          <Input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? t("common.loading") : t("auth.login")}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">{t("auth.noAccount")} <Link to="/signup" className="font-medium text-primary hover:underline">{t("auth.signup")}</Link></p>
    </AuthShell>
  );
}
