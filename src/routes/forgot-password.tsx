import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "Mot de passe oublié — ProofNest" }, { name: "description", content: "Réinitialisez votre mot de passe ProofNest." },
    { property: "og:title", content: "Mot de passe oublié — ProofNest" }, { property: "og:description", content: "Réinitialisez votre mot de passe ProofNest." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: () => {
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      setDone(true);
    };
    return (
      <AuthShell title={t("auth.forgotTitle")} subtitle={t("auth.forgotSub")}>
        {done ? (
          <p className="rounded-lg bg-accent p-4 text-sm text-accent-foreground">{t("auth.linkSent")}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button className="w-full" disabled={busy}>{busy ? t("common.loading") : t("auth.sendLink")}</Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="text-primary hover:underline">{t("common.back")}</Link></p>
      </AuthShell>
    );
  },
});
