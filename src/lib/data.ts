import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const testimonialsQuery = (status: "all" | "pending" | "approved" | "rejected", projectId?: string, page = 0, perPage = 20) =>
  queryOptions({
    queryKey: ["testimonials", status, projectId ?? "all", page],
    queryFn: async () => {
      let q = supabase.from("testimonials").select("*, projects(name, public_slug)", { count: "exact" }).order("submitted_at", { ascending: false }).range(page * perPage, page * perPage + perPage - 1);
      if (status !== "all") q = q.eq("status", status);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

async function countTestimonials(status?: "pending" | "approved") {
  let q = supabase.from("testimonials").select("id", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export const statsQuery = queryOptions({
  queryKey: ["stats"],
  queryFn: async () => {
    const [projects, total, pending, approved, views] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0),
      countTestimonials(),
      countTestimonials("pending"),
      countTestimonials("approved"),
      supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("event_type", "page_view").then((r) => r.count ?? 0),
    ]);
    return { projects, total, pending, approved, views };
  },
});

export const accountQuery = queryOptions({
  queryKey: ["account"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw new Error("Not signed in");
    const [profile, sub, plan, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", uid).maybeSingle(),
      supabase.rpc("effective_plan", { _user: uid }),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    return {
      user: u.user!,
      profile: profile.data,
      subscription: sub.data,
      plan: plan.data as unknown as Plan,
      isAdmin: (roles.data ?? []).some((r) => r.role === "admin"),
    };
  },
});

export function dbErrorKey(message: string): string {
  if (message.includes("PLAN_LIMIT_PROJECTS")) return "proj.limit";
  if (message.includes("PLAN_LIMIT_PUBLISHED")) return "test.limitPublished";
  if (message.includes("NO_CONSENT")) return "test.noConsent";
  if (message.includes("projects_public_slug_key") || message.includes("duplicate key")) return "proj.slugTaken";
  return "common.error";
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
