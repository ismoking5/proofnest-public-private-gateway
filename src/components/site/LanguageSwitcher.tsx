import { Globe } from "lucide-react";
import { LOCALE_LABELS, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <Globe className="h-4 w-4" />
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer bg-transparent text-sm focus:outline-none"
      >
        {Object.entries(LOCALE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );
}
