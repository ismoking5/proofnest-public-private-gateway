import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Copy, MessageSquareQuote, Pencil, Trash2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stars } from "@/components/Stars";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery, dbErrorKey, projectsQuery, testimonialsQuery, type Testimonial } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PER = 20;
const statuses = ["all", "pending", "approved", "rejected"] as const;

export const Route = createFileRoute("/_authenticated/dashboard/testimonials")({
  validateSearch: z.object({ status: z.enum(statuses).optional(), project: z.string().uuid().optional(), page: z.number().int().min(0).optional() }),
  component: Testimonials,
});

function Testimonials() {
  const { t, locale } = useI18n();
  const { status = "all", project, page = 0 } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard/testimonials" });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(testimonialsQuery(status, project, page, PER));
  const { data: projects } = useQuery(projectsQuery);
  const { data: account } = useQuery(accountQuery);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const setStatus = async (id: string, s: "approved" | "rejected" | "pending") => {
    const { error } = await supabase.from("testimonials").update({ status: s }).eq("id", id);
    if (error) return toast.error(t(dbErrorKey(error.message)));
    toast.success(t("common.saved"));
    qc.invalidateQueries();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(t("common.error"));
    setDeleting(null);
    qc.invalidateQueries();
  };
  const exportCsv = async () => {
    const { data: rows, error } = await supabase.from("testimonials").select("display_name, company_name, rating, content, status, submitted_at, projects(name)").order("submitted_at", { ascending: false }).limit(5000);
    if (error || !rows) return toast.error(t("common.error"));
    const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv = ["project,name,company,rating,status,submitted_at,content", ...rows.map((r) => [r.projects?.name, r.display_name, r.company_name, r.rating, r.status, r.submitted_at, r.content].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "testimonials.csv";
    a.click();
  };

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PER));
  const label = (s: string) => (s === "all" ? t("common.all") : t(`test.${s}`));

  return (
    <div>
      <PageTitle title={t("test.title")} action={account?.plan?.csv_export ? <Button variant="outline" onClick={exportCsv}><Download />CSV</Button> : undefined} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {statuses.map((s) => (
            <button key={s} onClick={() => navigate({ search: { status: s, project } })}
              className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors", status === s ? "bg-card shadow-card" : "text-muted-foreground hover:text-foreground")}>{label(s)}</button>
          ))}
        </div>
        <Select value={project ?? "all"} onValueChange={(v) => navigate({ search: { status, project: v === "all" ? undefined : v } })}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : !data?.rows.length ? (
        <EmptyState icon={MessageSquareQuote} title={t("test.empty")} />
      ) : (
        <div className="space-y-3">
          {data.rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{r.display_name}</span>
                {r.company_name && <span className="text-sm text-muted-foreground">{r.company_name}</span>}
                <Stars value={r.rating} size={14} />
                <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  r.status === "approved" ? "bg-success/15 text-success" : r.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning-foreground")}>{t(`test.${r.status}`)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{r.content}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("test.project")}: {r.projects?.name} · {t("test.received")} {new Date(r.submitted_at).toLocaleDateString(locale)}
                {r.contact_email && <> · {r.contact_email}</>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && <Button size="sm" onClick={() => setStatus(r.id, "approved")}><Check />{t("test.approve")}</Button>}
                {r.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}><X />{t("test.reject")}</Button>}
                <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Pencil />{t("common.edit")}</Button>
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(`“${r.content}” — ${r.display_name}${r.company_name ? `, ${r.company_name}` : ""}`).then(() => toast.success(t("common.copied")))}><Copy />{t("common.copy")}</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(r)}><Trash2 />{t("common.delete")}</Button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => navigate({ search: { status, project, page: page - 1 } })}>{t("common.previous")}</Button>
              <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => navigate({ search: { status, project, page: page + 1 } })}>{t("common.next")}</Button>
            </div>
          )}
        </div>
      )}

      {editing && <EditDialog item={editing} onClose={() => setEditing(null)} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{deleting?.display_name}</AlertDialogTitle><AlertDialogDescription>{t("test.deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && remove(deleting.id)}>{t("common.delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditDialog({ item, onClose }: { item: Testimonial; onClose: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [f, setF] = useState({ display_name: item.display_name, company_name: item.company_name ?? "", content: item.content });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("testimonials").update({ display_name: f.display_name, company_name: f.company_name || null, content: f.content }).eq("id", item.id);
    if (error) return toast.error(t("common.error"));
    qc.invalidateQueries();
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("test.editTitle")}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>{t("proj.name")}</Label><Input required maxLength={80} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t("test.company")}</Label><Input maxLength={100} value={f.company_name} onChange={(e) => setF({ ...f, company_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>{t("collect.content")}</Label><Textarea required minLength={10} maxLength={2000} rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button><Button>{t("common.save")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
