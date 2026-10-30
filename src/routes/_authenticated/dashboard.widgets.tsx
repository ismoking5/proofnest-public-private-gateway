import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Code2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { accountQuery, projectsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/widgets")({ component: Widgets });

const FORMATS = [
  { v: "grid", en: "Grid", fr: "Grille", h: 520 },
  { v: "list", en: "Vertical list", fr: "Liste verticale", h: 640 },
  { v: "badge", en: "Rating badge", fr: "Badge de note", h: 80 },
] as const;

function Widgets() {
  const { t, locale } = useI18n();
  const { data: projects } = useQuery(projectsQuery);
  const { data: account } = useQuery(accountQuery);
  const [pid, setPid] = useState<string>();
  const [format, setFormat] = useState<(typeof FORMATS)[number]["v"]>("grid");
  const [accent, setAccent] = useState<string>();
  useEffect(() => { if (!pid && projects?.[0]) setPid(projects[0].id); }, [projects, pid]);
  const project = projects?.find((p) => p.id === pid);
  const canCustomize = account?.plan?.code !== "free";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (!projects?.length) return (<div><PageTitle title={t("dash.widgets")} /><EmptyState icon={Code2} title={t("proj.empty")} action={<Button asChild><Link to="/dashboard/projects" search={{ new: true }}>{t("dash.newProject")}</Link></Button>} /></div>);

  const color = (accent ?? project?.primary_color ?? "#5B21B6").replace("#", "");
  const fmt = FORMATS.find((f) => f.v === format)!;
  const src = project ? `${origin}/embed/${project.public_slug}?format=${format}${canCustomize ? `&accent=${color}` : ""}` : "";
  const code = `<iframe src="${src}" title="Testimonials" loading="lazy" style="width:100%;height:${fmt.h}px;border:0;" sandbox="allow-scripts allow-popups allow-same-origin"></iframe>`;

  return (
    <div>
      <PageTitle title={t("dash.widgets")} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="space-y-1.5"><Label>{t("test.project")}</Label>
            <Select value={pid} onValueChange={setPid}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Format</Label>
            <div className="grid gap-2">{FORMATS.map((f) => (
              <button key={f.v} onClick={() => setFormat(f.v)} className={cn("rounded-lg border px-3 py-2 text-left text-sm", format === f.v ? "border-primary bg-accent" : "border-border")}>{f[locale]}</button>
            ))}</div></div>
          <div className="space-y-1.5"><Label>{t("proj.color")}</Label>
            <input type="color" disabled={!canCustomize} value={`#${color}`} onChange={(e) => setAccent(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-input disabled:opacity-50" />
            {!canCustomize && <p className="text-xs text-muted-foreground">{t("proj.brandingLocked")}</p>}</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            {src && <iframe key={src} src={src} title="preview" className="w-full rounded-lg border-0 bg-background" style={{ height: fmt.h }} />}
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Embed code</h3>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(code).then(() => toast.success(t("common.copied")))}><Copy />Copy Embed Code</Button></div>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">{code}</pre>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {locale === "fr" ? (<><li>Copiez le code ci-dessus.</li><li>Collez-le dans un bloc « HTML personnalisé » de votre site (WordPress, Webflow, Wix…).</li><li>Publiez : seuls les témoignages approuvés s'affichent.</li></>) :
                (<><li>Copy the code above.</li><li>Paste it into a “Custom HTML” block on your site (WordPress, Webflow, Wix…).</li><li>Publish — only approved testimonials appear.</li></>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
