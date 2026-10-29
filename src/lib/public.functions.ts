import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Public, read-only / RPC-only client. Security lives in SECURITY DEFINER functions in the DB.
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{2,48}$/);

export type PublicPage = {
  project: { name: string; description: string | null; logo_url: string | null; primary_color: string; website_url: string | null; show_branding: boolean; slug: string };
  stats: { count: number; average: number };
  items: { id: string; display_name: string; company_name: string | null; rating: number; content: string; photo_url: string | null; approved_at: string }[];
};

export const getPublicPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; page?: number; limit?: number }) =>
    z.object({ slug: slugSchema, page: z.number().int().min(0).max(1000).default(0), limit: z.number().int().min(1).max(50).default(12) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: res, error } = await publicClient().rpc("get_public_page", { _slug: data.slug, _limit: data.limit, _offset: data.page * data.limit });
    if (error) {
      console.error("get_public_page failed", error.code);
      throw new Error("Unable to load page");
    }
    return (res ?? null) as PublicPage | null;
  });

export const getCollectProject = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: slugSchema }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("get_collect_project", { _slug: data.slug });
    if (error) throw new Error("Unable to load form");
    return rows?.[0] ?? null;
  });

const submitSchema = z.object({
  slug: slugSchema,
  display_name: z.string().trim().min(1).max(80),
  email: z.string().trim().max(255).email().or(z.literal("")),
  company: z.string().trim().max(100),
  website: z.string().trim().max(300).url().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
  hp: z.string().max(200).optional(), // honeypot: must stay empty
  startedAt: z.number().optional(),
});

export const submitTestimonial = createServerFn({ method: "POST" })
  .inputValidator((d: z.input<typeof submitSchema>) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    // Bots: filled honeypot or impossibly fast submissions are silently accepted but dropped.
    if (data.hp || (data.startedAt && Date.now() - data.startedAt < 2500)) return { ok: true as const };
    const { error } = await publicClient().rpc("submit_testimonial", {
      _slug: data.slug, _display_name: data.display_name, _email: data.email, _company: data.company,
      _website: data.website, _rating: data.rating, _content: data.content, _consent: data.consent,
    });
    if (error) {
      const code = ["RATE_LIMITED", "NOT_FOUND", "PLAN_LIMIT_TESTIMONIALS", "CONSENT_REQUIRED"].find((c) => error.message.includes(c));
      return { ok: false as const, code: code ?? "ERROR" };
    }
    return { ok: true as const };
  });

export const recordView = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string; kind: "page_view" | "widget_view" }) =>
    z.object({ slug: slugSchema, kind: z.enum(["page_view", "widget_view"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    await publicClient().rpc("record_view", { _slug: data.slug, _kind: data.kind });
    return null;
  });

export const getPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("plans").select("*").order("sort_order");
  if (error) throw new Error("Unable to load plans");
  return data;
});

export const getPaymentsStatus = createServerFn({ method: "GET" }).handler(async () => {
  // Payments are considered configured only when the owner has added provider secrets.
  return { configured: Boolean(process.env["PAYMENT_PROVIDER"] && process.env["PAYMENT_SECRET_KEY"] && process.env["PAYMENT_WEBHOOK_SECRET"]) };
});
