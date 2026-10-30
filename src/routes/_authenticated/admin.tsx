import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";
import { adminOverview, adminSetDisabled, adminUpdatePlan } from "@/lib/admin.functions";
import { accountQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — ProofNest" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  const { data: account, isLoading } = useQuery(accountQuery);
  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!account?.isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Shield className="h-10 w-10 text-muted-foreground" /><p>Access restricted to administrators.</p>
        <Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  return <AdminPanel />;
}

function AdminPanel() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["admin", search], queryFn: () => adminOverview({ data: { q: search || undefined } }) });

  const toggle = async (userId: string, disabled: boolean) => {
    try { await adminSetDisabled({ data: { userId, disabled } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin"] }); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3"><Logo to="/dashboard" /><span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Admin</span></div>
        <Button asChild size="sm" variant="ghost"><Link to="/dashboard"><ArrowLeft />Dashboard</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {error && <p className="text-destructive">{(error as Error).message}</p>}
        {isLoading || !data ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[["Users", data.users], ["Projects", data.projects], ["Testimonials", data.testimonials], ["Payment events", data.events.length]].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl border border-border bg-card p-4 shadow-card"><p className="font-display text-2xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
              ))}
            </div>
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-semibold">Subscriptions</h2>
              <div className="mt-3 flex flex-wrap gap-2">{Object.entries(data.distribution).map(([k, v]) => <span key={k} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{k}: {v}</span>)}</div>
            </section>
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-semibold">Users</h2>
                <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="flex gap-2"><Input placeholder="Email or ID" value={q} onChange={(e) => setQ(e.target.value)} /><Button>Search</Button></form>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Email</th><th>Name</th><th>Plan</th><th>Created</th><th /></tr></thead>
                  <tbody>{data.list.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="py-2 pr-3">{u.email}</td><td className="pr-3">{u.name}</td><td className="pr-3">{u.plan} · {u.status}</td><td className="pr-3">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="text-right"><Button size="sm" variant={u.disabled ? "outline" : "ghost"} onClick={() => toggle(u.id, !u.disabled)}>{u.disabled ? "Enable" : "Disable"}</Button></td>
                    </tr>))}</tbody>
                </table>
              </div>
            </section>
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-semibold">Plans & limits</h2>
              <div className="mt-4 space-y-3">{data.plans.map((p) => <PlanRow key={p.code} plan={p} />)}</div>
            </section>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card"><h2 className="font-semibold">Payment events</h2>
                {data.events.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None.</p> : data.events.map((e) => <p key={e.id} className="mt-2 text-sm">{e.provider} · {e.event_type} · {e.processing_status}</p>)}</div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card"><h2 className="font-semibold">Audit log</h2>
                {data.audit.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None.</p> : data.audit.map((a) => <p key={a.id} className="mt-2 text-sm">{new Date(a.created_at).toLocaleString()} · {a.action} · {a.resource_id}</p>)}</div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function PlanRow({ plan }: { plan: { code: string; name: string; price_cents: number; max_projects: number; max_testimonials: number; max_published: number } }) {
  const qc = useQueryClient();
  const [f, setF] = useState(plan);
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) });
  const save = async () => {
    try { await adminUpdatePlan({ data: { code: f.code, price_cents: f.price_cents, max_projects: f.max_projects, max_testimonials: f.max_testimonials, max_published: f.max_published } }); toast.success("Plan saved"); qc.invalidateQueries(); }
    catch { toast.error("Failed"); }
  };
  return (
    <div className="grid grid-cols-2 items-end gap-2 rounded-lg border border-border p-3 md:grid-cols-6">
      <p className="col-span-2 font-semibold md:col-span-1">{plan.name}</p>
      {([["price_cents", "Price (cents)"], ["max_projects", "Projects"], ["max_testimonials", "Total"], ["max_published", "Published"]] as const).map(([k, l]) => (
        <label key={k} className="text-xs text-muted-foreground">{l}<Input type="number" min={0} value={f[k]} onChange={num(k)} /></label>
      ))}
      <Button size="sm" onClick={save}>Save</Button>
    </div>
  );
}
