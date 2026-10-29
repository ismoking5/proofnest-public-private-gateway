import { BarChart3, Code2, Link2, Lock, ShieldCheck, LayoutTemplate, PenLine, Share2, BadgeCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Stars } from "@/components/Stars";
import { useI18n } from "@/lib/i18n";

export function DemoPage() {
  const { t } = useI18n();
  const samples = [
    { n: "Sample Client A", c: "Example Studio", r: 5, q: "Clear communication and on-time delivery. Exactly what we needed." },
    { n: "Sample Client B", c: "Demo Agency", r: 5, q: "The new website doubled our inbound inquiries within weeks." },
    { n: "Sample Client C", c: "Placeholder Co.", r: 4, q: "Professional, responsive and genuinely invested in our success." },
  ];
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-primary opacity-15 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="ml-3 truncate rounded-md bg-card px-3 py-0.5 text-xs text-muted-foreground">proofnest.app/p/your-brand</span>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("home.demoLabel")}</p>
              <h3 className="mt-1 text-2xl font-bold">Your Brand</h3>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-2">
              <span className="font-display text-2xl font-bold text-accent-foreground">4.7</span>
              <Stars value={4.7} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {samples.map((s) => (
              <div key={s.n} className="rounded-xl border border-border p-4">
                <Stars value={s.r} size={14} />
                <p className="mt-3 text-sm leading-relaxed">“{s.q}”</p>
                <p className="mt-4 text-sm font-semibold">{s.n}</p>
                <p className="text-xs text-muted-foreground">{s.c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{t("home.demoNote")}</p>
    </div>
  );
}

export function Steps() {
  const { t } = useI18n();
  const steps = [
    { i: PenLine, h: t("home.step1"), d: t("home.step1d") },
    { i: Share2, h: t("home.step2"), d: t("home.step2d") },
    { i: BadgeCheck, h: t("home.step3"), d: t("home.step3d") },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {steps.map((s, idx) => (
        <div key={s.h} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><s.i className="h-5 w-5" /></span>
            <span className="font-display text-sm font-semibold text-muted-foreground">0{idx + 1}</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold">{s.h}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
        </div>
      ))}
    </div>
  );
}

export function FeatureGrid() {
  const { t } = useI18n();
  const items = [
    { i: Link2, h: t("features.collect"), d: t("features.collectD") },
    { i: ShieldCheck, h: t("features.moderate"), d: t("features.moderateD") },
    { i: LayoutTemplate, h: t("features.pages"), d: t("features.pagesD") },
    { i: Code2, h: t("features.widgets"), d: t("features.widgetsD") },
    { i: BarChart3, h: t("features.analytics"), d: t("features.analyticsD") },
    { i: Lock, h: t("features.security"), d: t("features.securityD") },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f) => (
        <div key={f.h} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card">
          <f.i className="h-6 w-6 text-primary" />
          <h3 className="mt-4 font-semibold">{f.h}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
        </div>
      ))}
    </div>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <Accordion type="single" collapsible className="mx-auto max-w-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <AccordionItem key={n} value={`q${n}`}>
          <AccordionTrigger className="text-left">{t(`faq.q${n}`)}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{t(`faq.a${n}`)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
