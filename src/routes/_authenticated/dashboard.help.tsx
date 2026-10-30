import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "@/components/dash/ui";
import { Faq, Steps } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/help")({
  component: () => {
    const { t } = useI18n();
    return (
      <div className="space-y-10">
        <PageTitle title={t("dash.help")} action={<Button asChild variant="outline"><Link to="/contact">{t("footer.contact")}</Link></Button>} />
        <Steps />
        <Faq />
      </div>
    );
  },
});
