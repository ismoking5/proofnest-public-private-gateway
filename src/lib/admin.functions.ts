import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { q?: string }) => z.object({ q: z.string().max(200).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const count = async (table: "projects" | "testimonials" | "profiles") =>
      (await supabaseAdmin.from(table).select("id", { count: "exact", head: true })).count ?? 0;
    const [users, projects, testimonials] = await Promise.all([count("profiles"), count("projects"), count("testimonials")]);
    const { data: subs } = await supabaseAdmin.from("subscriptions").select("plan_code, status");
    const distribution: Record<string, number> = {};
    for (const s of subs ?? []) distribution[`${s.plan_code} (${s.status})`] = (distribution[`${s.plan_code} (${s.status})`] ?? 0) + 1;
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, display_name, is_disabled, created_at");
    const subMap = new Map((await supabaseAdmin.from("subscriptions").select("user_id, plan_code, status")).data?.map((s) => [s.user_id, s]) ?? []);
    const q = data.q?.toLowerCase();
    const list = (authUsers?.users ?? [])
      .filter((u) => !q || u.email?.toLowerCase().includes(q) || u.id.includes(q))
      .slice(0, 100)
      .map((u) => {
        const p = profiles?.find((x) => x.id === u.id);
        const s = subMap.get(u.id);
        return { id: u.id, email: u.email ?? "", name: p?.display_name ?? "", disabled: p?.is_disabled ?? false, created_at: u.created_at, plan: s?.plan_code ?? "free", status: s?.status ?? "free" };
      });
    const { data: events } = await supabaseAdmin.from("payment_events").select("*").order("created_at", { ascending: false }).limit(50);
    const { data: audit } = await supabaseAdmin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
    const { data: plans } = await supabaseAdmin.from("plans").select("*").order("sort_order");
    return { users, projects, testimonials, distribution, list, events: events ?? [], audit: audit ?? [], plans: plans ?? [] };
  });

export const adminSetDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; disabled: boolean }) => z.object({ userId: z.string().uuid(), disabled: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("You cannot disable your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ is_disabled: data.disabled }).eq("id", data.userId);
    await supabaseAdmin.from("audit_logs").insert({ actor_id: context.userId, action: data.disabled ? "user.disable" : "user.enable", resource_type: "user", resource_id: data.userId });
    return { ok: true };
  });

export const adminUpdatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      code: z.string().max(20), price_cents: z.number().int().min(0).max(1_000_000),
      max_projects: z.number().int().min(0).max(10000), max_testimonials: z.number().int().min(0).max(1_000_000), max_published: z.number().int().min(0).max(1_000_000),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { code, ...rest } = data;
    const { error } = await supabaseAdmin.from("plans").update({ ...rest, updated_at: new Date().toISOString() }).eq("code", code);
    if (error) throw new Error("Update failed");
    await supabaseAdmin.from("audit_logs").insert({ actor_id: context.userId, action: "plan.update", resource_type: "plan", resource_id: code });
    return { ok: true };
  });
