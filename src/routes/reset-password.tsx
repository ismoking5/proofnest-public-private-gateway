import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Choose a new password — ProofNest" }, { name: "description", content: "Set a new password for your ProofNest account." },
    { property: "og:title", content: "New password — ProofNest" }, { property: "og:description", content: "Set a new password for your ProofNest account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ]}),
  component: () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [pw, setPw] = useState("");
    const [busy, setBusy] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (pw.length < 8) return toast.error(t("auth.passwordMin"));
      setBusy(true);
      const { error } = await supabase.auth.updateUser({ password: pw });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success(t("auth.passwordUpdated"));
      navigate({ to: "/dashboard" });
    };
    return (
      <AuthShell title={t("auth.resetTitle")}>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="pw">{t("auth.newPassword")}</Label><Input id="pw" type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} /><p className="text-xs text-muted-foreground">{t("auth.passwordMin")}</p></div>
          <Button className="w-full" disabled={busy}>{busy ? t("common.loading") : t("auth.updatePassword")}</Button>
        </form>
      </AuthShell>
    );
  },
});
