import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-hero">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 md:items-center">
        <div className="animate-rise w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-card md:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SocialButtons() {
  const { t } = useI18n();
  const go = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/login" });
    if (r.error) toast.error(t("common.error"));
  };
  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" onClick={go}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6a5.1 5.1 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10l3.7-2.9Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>
        {t("auth.google")}
      </Button>
      <div className="relative py-3 text-center text-xs uppercase text-muted-foreground">
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative bg-card px-2">{t("auth.or")}</span>
      </div>
    </div>
  );
}
