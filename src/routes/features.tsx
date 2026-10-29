import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { FeatureGrid } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ProofNest" },
      { name: "description", content: "Collection links, moderation, public pages, embeddable widgets and analytics for customer testimonials." },
      { property: "og:title", content: "Features — ProofNest" },
      { property: "og:description", content: "Everything you need to collect and display customer testimonials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const { t } = useI18n();
    return (
      <SiteLayout>
        <PageHero title={t("features.title")} subtitle={t("features.subtitle")} />
        <section className="mx-auto max-w-6xl px-4 py-16"><FeatureGrid /></section>
      </SiteLayout>
    );
  },
});
