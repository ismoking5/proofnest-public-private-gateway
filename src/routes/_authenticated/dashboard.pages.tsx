import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { supabase } from "@/integrations/supabase/client";
import { projectsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/pages")({ component: Pages });

function Pages() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: projects } = useQuery(projectsQuery);
  const toggle = async (id: string, v: boolean) => {
    const { error } = await supabase.from("projects").update({ is_public: v }).eq("id", id);
    if (error) { toast.error(t("common.error")); return; }
    qc.invalidateQueries({ queryKey: ["projects"] });
  };
  return (
    <div>
      <PageTitle title={t("dash.pages")} />
      {!projects?.length ? (
        <EmptyState icon={Globe} title={t("proj.empty")} action={<Button asChild><Link to="/dashboard/projects" search={{ new: true }}>{t("dash.newProject")}</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="truncate text-sm text-muted-foreground">/p/{p.public_slug}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">{t("proj.isPublic")}<Switch checked={p.is_public} onCheckedChange={(v) => toggle(p.id, v)} /></label>
              <Button size="sm" variant="outline" asChild disabled={!p.is_public}><a href={`/p/${p.public_slug}`} target="_blank" rel="noopener"><ExternalLink />{t("common.open")}</a></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
