import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { FeatureGrid } from "@/components/site/Sections";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Fonctionnalités — ProofNest" },
      { name: "description", content: "Liens de collecte, modération, pages publiques, widgets intégrables et statistiques pour vos témoignages clients." },
      { property: "og:title", content: "Fonctionnalités — ProofNest" },
      { property: "og:description", content: "Tout ce qu'il faut pour collecter et afficher des témoignages clients." },
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
