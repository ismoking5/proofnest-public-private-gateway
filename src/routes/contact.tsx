import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

// Replace with the owner's real support address before launch.
const SUPPORT_EMAIL = "support@proofnest.app";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — ProofNest" }, { name: "description", content: "Get in touch with the ProofNest team." },
    { property: "og:title", content: "Contact ProofNest" }, { property: "og:description", content: "Get in touch with the ProofNest team." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: () => {
    const { t, locale } = useI18n();
    return (
      <SiteLayout>
        <PageHero title={t("footer.contact")} subtitle={locale === "fr" ? "Une question, un problème, une suggestion ? Écrivez-nous." : "A question, an issue, a suggestion? Write to us."} />
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <Mail className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-4 font-semibold">{SUPPORT_EMAIL}</p>
            <Button asChild className="mt-6"><a href={`mailto:${SUPPORT_EMAIL}`}>{locale === "fr" ? "Envoyer un e-mail" : "Send an email"}</a></Button>
          </div>
        </div>
      </SiteLayout>
    );
  },
});
