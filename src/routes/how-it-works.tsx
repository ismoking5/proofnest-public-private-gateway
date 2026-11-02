import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { DemoPage, Steps } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — ProofNest" },
      { name: "description", content: "Créez une page, partagez votre lien de collecte, affichez les témoignages approuvés. Trois étapes simples." },
      { property: "og:title", content: "Comment fonctionne ProofNest" },
      { property: "og:description", content: "De la première demande à la preuve publiée en quelques minutes." },
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
