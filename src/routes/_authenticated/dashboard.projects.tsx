import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Copy, ExternalLink, FolderKanban, MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState, PageTitle } from "@/components/dash/ui";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery, dbErrorKey, projectsQuery, slugify, type Project } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: Projects,
});

export function copyText(text: string, msg: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(msg));
}

function Projects() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery(projectsQuery);
  const { data: account } = useQuery(accountQuery);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  useEffect(() => {
    if (search.new) {
      setEditing("new");
      navigate({ to: "/dashboard/projects", search: {}, replace: true });
    }
  }, [search.new, navigate]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries(); setDeleting(null); },
    onError: () => toast.error(t("common.error")),
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div>
      <PageTitle title={t("proj.title")} action={<Button onClick={() => setEditing("new")}><Plus />{t("dash.newProject")}</Button>} />
      {isLoading ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : !projects?.length ? (
        <EmptyState icon={FolderKanban} title={t("proj.empty")} text={t("dash.emptySub")} action={<Button onClick={() => setEditing("new")}><Plus />{t("dash.newProject")}</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                {p.logo_url ? <img src={p.logo_url} alt="" className="h-11 w-11 rounded-lg border border-border object-contain" /> :
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg font-display font-bold text-primary-foreground" style={{ background: p.primary_color }}>{p.name[0]}</span>}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{p.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">/{p.public_slug} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label={t("common.edit")}><Pencil /></Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleting(p)} aria-label={t("common.delete")}><Trash2 className="text-destructive" /></Button>
              </div>
              {p.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(`${origin}/c/${p.public_slug}`, t("common.copied"))}><Copy />{t("proj.copyLink")}</Button>
                <Button size="sm" variant="outline" asChild><Link to="/dashboard/testimonials" search={{ project: p.id }}><MessageSquareQuote />{t("proj.viewTestimonials")}</Link></Button>
                <Button size="sm" variant="ghost" asChild><a href={`/p/${p.public_slug}`} target="_blank" rel="noopener"><ExternalLink />{t("proj.viewPage")}</a></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <ProjectDialog project={editing === "new" ? null : editing} customBranding={account?.plan?.custom_branding ?? false} onClose={() => setEditing(null)} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{deleting?.name}</AlertDialogTitle><AlertDialogDescription>{t("proj.deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && del.mutate(deleting.id)}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProjectDialog({ project, customBranding, onClose }: { project: Project | null; customBranding: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: project?.name ?? "", description: project?.description ?? "", website_url: project?.website_url ?? "", logo_url: project?.logo_url ?? "",
    primary_color: project?.primary_color ?? "#5B21B6", public_slug: project?.public_slug ?? "", is_public: project?.is_public ?? true, show_branding: project?.show_branding ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(!!project);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = f.public_slug || slugify(f.name);
    if (!/^[a-z0-9][a-z0-9-]{2,48}$/.test(slug)) return toast.error(t("proj.slugHelp"));
    const norm = (u: string) => (u && !/^https?:\/\//.test(u) ? `https://${u}` : u) || null;
    const payload = { ...f, public_slug: slug, website_url: norm(f.website_url), logo_url: norm(f.logo_url), description: f.description || null };
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert({ ...payload, owner_id: u.user!.id });
    setBusy(false);
    if (error) return toast.error(t(dbErrorKey(error.message)));
    toast.success(project ? t("common.saved") : t("proj.created"));
    qc.invalidateQueries();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{project ? t("proj.editTitle") : t("proj.newTitle")}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="pn">{t("proj.name")}</Label>
            <Input id="pn" required maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, public_slug: slugTouched ? f.public_slug : slugify(e.target.value) })} /></div>
          <div className="space-y-1.5"><Label htmlFor="ps">{t("proj.slug")}</Label>
            <Input id="ps" required pattern="[a-z0-9][a-z0-9-]{2,48}" value={f.public_slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, public_slug: e.target.value.toLowerCase() }); }} />
            <p className="text-xs text-muted-foreground">{t("proj.slugHelp")}</p></div>
          <div className="space-y-1.5"><Label htmlFor="pd">{t("proj.description")}</Label><Textarea id="pd" maxLength={500} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="pw">{t("proj.website")}</Label><Input id="pw" maxLength={300} value={f.website_url} onChange={(e) => setF({ ...f, website_url: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pl">{t("proj.logo")}</Label><Input id="pl" maxLength={500} placeholder="https://…/logo.png" value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="pc">{t("proj.color")}</Label>
            <div className="flex items-center gap-2"><input id="pc" type="color" value={f.primary_color} onChange={(e) => setF({ ...f, primary_color: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer rounded border border-input" />
              <Input value={f.primary_color} pattern="#[0-9A-Fa-f]{6}" onChange={(e) => setF({ ...f, primary_color: e.target.value })} className="w-32" /></div></div>
          <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">{t("proj.isPublic")}<Switch checked={f.is_public} onCheckedChange={(v) => setF({ ...f, is_public: v })} /></label>
          <div className="rounded-lg border border-border p-3 text-sm">
            <label className="flex items-center justify-between">{t("proj.branding")}<Switch disabled={!customBranding} checked={customBranding ? f.show_branding : true} onCheckedChange={(v) => setF({ ...f, show_branding: v })} /></label>
            {!customBranding && <p className="mt-1 text-xs text-muted-foreground">{t("proj.brandingLocked")}</p>}
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button><Button disabled={busy}>{busy ? t("common.loading") : t("common.save")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
