import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { PageTitle } from "@/components/dash/ui";
import { PricingCards, paymentsQuery } from "@/components/site/PricingCards";
import { accountQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({ component: Billing });

function Billing() {
  const { t, locale } = useI18n();
  const { data: account } = useQuery(accountQuery);
  const { data: pay } = useQuery(paymentsQuery);
  const sub = account?.subscription;
  const fr = locale === "fr";
  return (
    <div>
      <PageTitle title={t("dash.billing")} />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">{fr ? "Offre actuelle" : "Current plan"}</p><p className="mt-1 font-display text-xl font-bold">{account?.plan?.name ?? "…"}</p></div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">{fr ? "Statut" : "Status"}</p><p className="mt-1 font-display text-xl font-bold">{sub?.status ?? "free"}</p></div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card"><p className="text-xs text-muted-foreground">{fr ? "Prochain renouvellement" : "Next renewal"}</p><p className="mt-1 font-display text-xl font-bold">{sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(locale) : "—"}</p></div>
      </div>
      {pay && !pay.configured && (
        <div className="mb-8 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <Info className="h-5 w-5 shrink-0" />
          <p>{fr ? "Les paiements ne sont pas encore configurés. Votre compte fonctionne normalement en mode gratuit. Aucun paiement, facture ou renouvellement n'a été enregistré." : "Payments are not configured yet. Your account works normally on the Free plan. No payment, invoice or renewal has been recorded."}</p>
        </div>
      )}
      <h2 className="mb-2 font-semibold">{fr ? "Historique des paiements" : "Payment history"}</h2>
      <p className="mb-10 rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">{fr ? "Aucun paiement pour le moment." : "No payments yet."}</p>
      <PricingCards currentPlan={account?.plan?.code} />
    </div>
  );
}
