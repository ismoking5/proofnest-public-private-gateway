import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const content = {
  en: { title: "Refund Policy", updated: "Last updated: October 2026", sections: [
    { h: "Free plan", p: "The Free plan costs nothing and requires no payment information." },
    { h: "Subscriptions", p: "Paid plans are billed monthly in advance. You can cancel at any time; your plan stays active until the end of the paid period." },
    { h: "Refunds", p: "If you are charged in error or experience a service failure, contact us within 14 days of the charge and we will review your request. Statutory consumer rights in your country always apply." },
    { h: "Failed payments", p: "If a renewal fails, your subscription is marked past due and may return to the Free plan after a grace period. Your data is not deleted." },
  ]},
  fr: { title: "Politique de remboursement", updated: "Dernière mise à jour : octobre 2026", sections: [
    { h: "Offre gratuite", p: "L'offre Free est gratuite et ne nécessite aucune information de paiement." },
    { h: "Abonnements", p: "Les offres payantes sont facturées mensuellement à l'avance. Vous pouvez annuler à tout moment ; votre offre reste active jusqu'à la fin de la période payée." },
    { h: "Remboursements", p: "En cas de prélèvement erroné ou de défaillance du service, contactez-nous dans les 14 jours et nous étudierons votre demande. Les droits légaux des consommateurs de votre pays s'appliquent toujours." },
    { h: "Paiements échoués", p: "Si un renouvellement échoue, votre abonnement passe en impayé et peut revenir à l'offre gratuite après un délai de grâce. Vos données ne sont pas supprimées." },
  ]},
};

export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [
    { title: "Refund Policy — ProofNest" }, { name: "description", content: "ProofNest subscription and refund policy." },
    { property: "og:title", content: "Refund Policy — ProofNest" }, { property: "og:description", content: "ProofNest subscription and refund policy." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: () => <LegalPage content={content} />,
});
