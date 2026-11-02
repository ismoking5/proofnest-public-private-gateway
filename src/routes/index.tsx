import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DemoPage, Faq, FeatureGrid, Steps } from "@/components/site/Sections";
import { PricingCards } from "@/components/site/PricingCards";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProofNest — Transformez vos clients satisfaits en votre meilleur marketing" },
      { name: "description", content: "Collectez des témoignages clients authentiques, modérez-les et affichez-les sur votre site en quelques minutes." },
      { property: "og:title", content: "ProofNest — Transformez vos clients satisfaits en votre meilleur marketing" },
      { property: "og:description", content: "Collectez, modérez et affichez des témoignages clients authentiques en quelques minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> {t("home.eyebrow")}
          </span>
          <h1 className="animate-rise mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
            Transformez vos clients satisfaits en votre <span className="bg-gradient-primary bg-clip-text text-transparent">meilleur marketing</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("home.subtitle")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="hero"><Link to="/signup">{t("home.ctaPrimary")} <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/how-it-works">{t("home.ctaSecondary")}</Link></Button>
          </div>
          <div className="mt-16"><DemoPage /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">{t("home.stepsTitle")}</h2>
        <div className="mt-10"><Steps /></div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">{t("home.featuresTitle")}</h2>
          <div className="mt-10"><FeatureGrid /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">{t("home.pricingTitle")}</h2>
        <div className="mt-10"><PricingCards /></div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">{t("home.faqTitle")}</h2>
          <Faq />
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-night px-6 py-14 text-center text-secondary-foreground shadow-elegant">
          <h2 className="text-3xl font-bold md:text-4xl">{t("home.finalTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-80">{t("home.finalSub")}</p>
          <Button asChild size="lg" variant="hero" className="mt-8"><Link to="/signup">{t("home.ctaPrimary")} <ArrowRight /></Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
