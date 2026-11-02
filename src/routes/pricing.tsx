import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { PricingCards } from "@/components/site/PricingCards";
import { Faq } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — ProofNest" },
      { name: "description", content: "Les offres Gratuit, Starter et Pro pour collecter et afficher des témoignages clients." },
      { property: "og:title", content: "Tarifs ProofNest" },
      { property: "og:description", content: "Commencez gratuitement. Évoluez quand vous grandissez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const { t } = useI18n();
    return (
      <SiteLayout>
        <PageHero title={t("pricing.title")} subtitle={t("pricing.subtitle")} />
        <section className="mx-auto max-w-6xl px-4 py-12"><PricingCards /></section>
        <section className="mx-auto max-w-6xl px-4 pb-20"><Faq /></section>
      </SiteLayout>
    );
  },
});
