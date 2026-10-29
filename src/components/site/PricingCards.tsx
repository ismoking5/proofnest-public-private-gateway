import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentsStatus, getPlans } from "@/lib/public.functions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const plansQuery = { queryKey: ["plans"], queryFn: () => getPlans(), staleTime: 60_000 };
export const paymentsQuery = { queryKey: ["payments-status"], queryFn: () => getPaymentsStatus(), staleTime: 60_000 };

export function formatPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

export function PricingCards({ currentPlan }: { currentPlan?: string }) {
  const { t, locale } = useI18n();
  const { data: plans } = useQuery(plansQuery);
  const { data: pay } = useQuery(paymentsQuery);

  const features = (code: string, p: NonNullable<typeof plans>[number]) => {
    const f = [t("pricing.projects", { n: p.max_projects })];
    if (code === "free") f.push(t("pricing.published", { n: p.max_published }), t("pricing.publicPage"), t("pricing.form"), t("pricing.branding"), t("pricing.basicWidgets"), t("pricing.simpleDash"));
    if (code === "starter") f.push(t("pricing.testimonials", { n: p.max_testimonials }), t("pricing.customBranding"), t("pricing.customWidgets"), t("pricing.basicAnalytics"), t("pricing.csv"), t("pricing.support"));
    if (code === "pro") f.push(t("pricing.testimonials", { n: p.max_testimonials }), t("pricing.allWidgets"), t("pricing.advancedAnalytics"), t("pricing.csv"), t("pricing.team"), t("pricing.prioritySupport"));
    return f;
  };

  if (!plans) return <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />)}</div>;

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const featured = p.code === "starter";
          const isCurrent = currentPlan === p.code;
          return (
            <div key={p.code} className={cn("relative flex flex-col rounded-2xl border bg-card p-7 shadow-card", featured && "border-primary shadow-elegant")}>
              {featured && <span className="absolute -top-3 left-7 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t("pricing.popular")}</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{formatPrice(p.price_cents, p.currency, locale)}</span>
                <span className="text-muted-foreground">{t("common.perMonth")}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {features(p.code, p).map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
              <div className="mt-7">
                {isCurrent ? (
                  <Button disabled variant="outline" className="w-full">{t("pricing.current")}</Button>
                ) : p.code === "free" ? (
                  <Button asChild variant="outline" className="w-full"><Link to="/signup">{t("nav.signup")}</Link></Button>
                ) : pay?.configured ? (
                  <Button asChild variant={featured ? "hero" : "default"} className="w-full"><Link to="/dashboard/billing">{t("pricing.choose")}</Link></Button>
                ) : (
                  <Button disabled variant={featured ? "hero" : "default"} className="w-full">{t("common.unavailable")}</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {pay && !pay.configured && (
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Info className="h-4 w-4" />{t("pricing.paymentsSoon")}</p>
      )}
    </div>
  );
}
