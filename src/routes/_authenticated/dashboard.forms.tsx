import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, Link2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { projectsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/forms")({ component: Forms });

function Forms() {
  const { t } = useI18n();
  const { data: projects } = useQuery(projectsQuery);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div>
      <PageTitle title={t("dash.forms")} />
      {!projects?.length ? (
        <EmptyState icon={Link2} title={t("proj.empty")} action={<Button asChild><Link to="/dashboard/projects" search={{ new: true }}>{t("dash.newProject")}</Link></Button>} />
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const url = `${origin}/c/${p.public_slug}`;
            const msg = `${p.name}: ${url}`;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-semibold">{p.name}</h3>
                <code className="mt-2 block truncate rounded-md bg-muted px-3 py-2 text-sm">{url}</code>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(url).then(() => toast.success(t("common.copied")))}><Copy />{t("common.copy")}</Button>
                  <Button size="sm" variant="outline" asChild><a href={`mailto:?subject=${encodeURIComponent(p.name)}&body=${encodeURIComponent(msg)}`}><Mail />Email</a></Button>
                  <Button size="sm" variant="outline" asChild><a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener"><MessageCircle />WhatsApp</a></Button>
                  <Button size="sm" variant="ghost" asChild><a href={url} target="_blank" rel="noopener"><ExternalLink />{t("common.open")}</a></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
