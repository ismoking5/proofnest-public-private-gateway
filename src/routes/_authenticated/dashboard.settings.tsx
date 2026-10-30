import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/dash/ui";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery } from "@/lib/data";
import { LOCALE_LABELS, useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({ component: Settings });

function Settings() {
  const { t, locale, setLocale } = useI18n();
  const qc = useQueryClient();
  const { data: account } = useQuery(accountQuery);
  const [name, setName] = useState("");
  const [lang, setLang] = useState<Locale>(locale);
  useEffect(() => {
    if (account?.profile) { setName(account.profile.display_name ?? ""); setLang(account.profile.preferred_language as Locale); }
  }, [account?.profile]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ display_name: name.slice(0, 100), preferred_language: lang }).eq("id", account!.user.id);
    if (error) return toast.error(t("common.error"));
    setLocale(lang);
    qc.invalidateQueries({ queryKey: ["account"] });
    toast.success(t("common.saved"));
  };
  return (
    <div>
      <PageTitle title={t("dash.settings")} />
      <form onSubmit={save} className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-1.5"><Label>{t("auth.name")}</Label><Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>{t("auth.email")}</Label><Input value={account?.user.email ?? ""} disabled /></div>
        <div className="space-y-1.5"><Label>{t("nav.language")}</Label>
          <select value={lang} onChange={(e) => setLang(e.target.value as Locale)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {Object.entries(LOCALE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <p className="text-xs text-muted-foreground">{locale === "fr" ? "Compte créé le" : "Account created"} {account?.profile && new Date(account.profile.created_at).toLocaleDateString(locale)}</p>
        <Button>{t("common.save")}</Button>
      </form>
    </div>
  );
}
