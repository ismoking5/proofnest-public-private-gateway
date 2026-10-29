import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { DemoPage, Steps } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — ProofNest" },
      { name: "description", content: "Create a page, share your collection link, display approved testimonials. Three simple steps." },
      { property: "og:title", content: "How ProofNest works" },
      { property: "og:description", content: "From first request to published social proof in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const { t } = useI18n();
    return (
      <SiteLayout>
        <PageHero title={t("how.title")} subtitle={t("how.subtitle")} />
        <section className="mx-auto max-w-6xl px-4 py-12"><Steps /></section>
        <section className="mx-auto max-w-6xl px-4 pb-20"><DemoPage /></section>
        <div className="pb-20 text-center"><Button asChild size="lg" variant="hero"><Link to="/signup">{t("home.ctaPrimary")}</Link></Button></div>
      </SiteLayout>
    );
  },
});
