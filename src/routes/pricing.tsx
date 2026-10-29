import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { PricingCards } from "@/components/site/PricingCards";
import { Faq } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ProofNest" },
      { name: "description", content: "Free, Starter and Pro plans for collecting and displaying customer testimonials." },
      { property: "og:title", content: "ProofNest pricing" },
      { property: "og:description", content: "Start free. Upgrade when you grow." },
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
