import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Eye, FolderKanban, MessageSquareQuote, Plus, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { accountQuery, statsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/")({ component: Overview });

function Overview() {
  const { t } = useI18n();
  const { data: account } = useQuery(accountQuery);
  const { data: s, isLoading } = useQuery(statsQuery);

  const cards = [
    { k: "statProjects", v: s?.projects, i: FolderKanban },
    { k: "statTotal", v: s?.total, i: MessageSquareQuote },
    { k: "statPending", v: s?.pending, i: Clock },
    { k: "statApproved", v: s?.approved, i: ThumbsUp },
    { k: "statViews", v: s?.views, i: Eye },
  ];
  const plan = account?.plan;

  return (
    <div>
      <PageTitle
        title={t("dash.welcome", { name: account?.profile?.display_name ?? "" })}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/dashboard/forms"><Send />{t("dash.requestTestimonial")}</Link></Button>
            <Button asChild><Link to="/dashboard/projects" search={{ new: true }}><Plus />{t("dash.newProject")}</Link></Button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.k} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <c.i className="h-4 w-4 text-primary" />
            <p className="mt-3 font-display text-2xl font-bold">{isLoading ? "…" : c.v}</p>
            <p className="text-xs text-muted-foreground">{t(`dash.${c.k}`)}</p>
          </div>
        ))}
      </div>

      {s && s.projects === 0 && (
        <div className="mt-8">
          <EmptyState icon={FolderKanban} title={t("dash.emptyTitle")} text={t("dash.emptySub")}
            action={<Button asChild variant="hero"><Link to="/dashboard/projects" search={{ new: true }}><Plus />{t("dash.newProject")}</Link></Button>} />
        </div>
      )}

      {plan && s && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("dash.usage")} — {plan.name}</h2>
            <Link to="/dashboard/billing" className="text-sm text-primary hover:underline">{t("dash.billing")}</Link>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {[
              { l: t("dash.projectsUsed"), v: s.projects, m: plan.max_projects },
              { l: t("dash.publishedUsed"), v: s.approved, m: plan.max_published },
              { l: t("dash.totalUsed"), v: s.total, m: plan.max_testimonials },
            ].map((u) => (
              <div key={u.l}>
                <div className="flex justify-between text-sm"><span>{u.l}</span><span className="text-muted-foreground">{u.v} / {u.m}</span></div>
                <Progress value={Math.min(100, (u.v / Math.max(1, u.m)) * 100)} className="mt-2 h-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
