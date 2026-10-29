import { PageHero, SiteLayout } from "./SiteLayout";
import { useI18n } from "@/lib/i18n";

export type LegalContent = { title: string; updated: string; sections: { h: string; p: string }[] };

export function LegalPage({ content }: { content: { en: LegalContent; fr: LegalContent } }) {
  const { locale } = useI18n();
  const c = content[locale];
  return (
    <SiteLayout>
      <PageHero title={c.title} subtitle={c.updated} />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="mb-8 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
          {locale === "fr"
            ? "Texte de base fourni à titre indicatif. Il doit être vérifié par un professionnel du droit avant tout lancement commercial."
            : "Baseline text provided for guidance. It must be reviewed by a legal professional before commercial launch."}
        </p>
        {c.sections.map((s) => (
          <section key={s.h} className="mb-8">
            <h2 className="text-xl font-semibold">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </article>
    </SiteLayout>
  );
}
