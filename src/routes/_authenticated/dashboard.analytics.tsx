import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { supabase } from "@/integrations/supabase/client";
import { statsQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({ component: Analytics });

function Analytics() {
  const { t, locale } = useI18n();
  const { data: s } = useQuery(statsQuery);
  const { data: daily } = useQuery({
    queryKey: ["analytics-daily"],
    queryFn: async () => {
      const since = new Date(Date.now() - 29 * 864e5);
      since.setHours(0, 0, 0, 0);
      const { data, error } = await supabase.from("usage_events").select("event_type, created_at").gte("created_at", since.toISOString()).limit(10000);
      if (error) throw error;
      const days = Array.from({ length: 30 }, (_, i) => ({ d: new Date(since.getTime() + i * 864e5), views: 0, subs: 0 }));
      for (const e of data) {
        const idx = Math.floor((new Date(e.created_at).getTime() - since.getTime()) / 864e5);
        if (days[idx]) e.event_type === "submission" ? days[idx].subs++ : days[idx].views++;
      }
      return days;
    },
  });
  const rate = s && s.total ? Math.round((s.approved / s.total) * 100) : null;
  const hasData = daily?.some((d) => d.views || d.subs);
  const max = Math.max(1, ...(daily ?? []).map((d) => d.views + d.subs));
  const L = locale === "fr" ? { sub: "Soumissions", rate: "Taux d'approbation", views: "Vues", last: "30 derniers jours", none: "Pas encore de données. Partagez votre lien de collecte pour voir vos statistiques." } :
    { sub: "Submissions", rate: "Approval rate", views: "Views", last: "Last 30 days", none: "No data yet. Share your collection link to start seeing stats." };

  return (
    <div>
      <PageTitle title={t("dash.analytics")} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[[L.sub, s?.total], [t("dash.statApproved"), s?.approved], [L.rate, rate === null ? "–" : `${rate}%`], [t("dash.statViews"), s?.views]].map(([l, v]) => (
          <div key={String(l)} className="rounded-xl border border-border bg-card p-4 shadow-card"><p className="font-display text-2xl font-bold">{v ?? "…"}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-semibold">{L.last}</h2>
        {!hasData ? <div className="mt-4"><EmptyState icon={BarChart3} title={L.none} /></div> : (
          <>
            <div className="mt-6 flex h-48 items-end gap-1">
              {daily!.map((d) => (
                <div key={d.d.toISOString()} className="flex flex-1 flex-col justify-end" title={`${d.d.toLocaleDateString(locale)} — ${L.views}: ${d.views}, ${L.sub}: ${d.subs}`}>
                  <div className="rounded-t bg-chart-2" style={{ height: `${(d.subs / max) * 100}%` }} />
                  <div className="bg-primary/70" style={{ height: `${(d.views / max) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-primary/70" />{L.views}</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-chart-2" />{L.sub}</span></div>
          </>
        )}
      </div>
    </div>
  );
}
