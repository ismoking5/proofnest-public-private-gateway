import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { getPublicPage, recordView } from "@/lib/public.functions";
import { Stars } from "@/components/Stars";
import { TestimonialCard } from "@/components/TestimonialCard";
import { LogoMark } from "@/components/brand/Logo";

// Iframe widget. Only approved + consented testimonials are ever returned by get_public_page.
export const Route = createFileRoute("/embed/$slug")({
  validateSearch: z.object({
    format: z.enum(["grid", "list", "badge"]).catch("grid"),
    limit: z.number().int().min(1).max(24).catch(6),
    bg: z.string().regex(/^[0-9a-fA-F]{6}$/).optional().catch(undefined),
    accent: z.string().regex(/^[0-9a-fA-F]{6}$/).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ limit: search.limit }),
  loader: async ({ params, deps }) => {
    if (!/^[a-z0-9][a-z0-9-]{2,48}$/.test(params.slug)) throw notFound();
    const data = await getPublicPage({ data: { slug: params.slug, limit: deps.limit, page: 0 } });
    if (!data) throw notFound();
    return data;
  },
  head: () => ({ meta: [{ title: "ProofNest widget" }, { name: "robots", content: "noindex" }] }),
  notFoundComponent: () => null,
  component: Embed,
});

function Embed() {
  const { project, stats, items } = Route.useLoaderData();
  const { format, bg, accent } = Route.useSearch();
  const { slug } = Route.useParams();
  const color = accent ? `#${accent}` : project.primary_color;
  useEffect(() => {
    recordView({ data: { slug, kind: "widget_view" } }).catch(() => {});
  }, [slug]);

  const brand = project.show_branding && (
    <a href={`/p/${slug}`} target="_blank" rel="noopener" className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><LogoMark className="h-3.5 w-3.5" />Powered by ProofNest</a>
  );

  return (
    <div className="p-3" style={{ background: bg ? `#${bg}` : "transparent" }}>
      {format === "badge" ? (
        <a href={`/p/${slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-card">
          <span className="font-display text-xl font-bold" style={{ color }}>{stats.count ? stats.average : "–"}</span>
          <Stars value={stats.average} size={14} />
          <span className="text-xs text-muted-foreground">{stats.count} reviews · {project.name}</span>
        </a>
      ) : (
        <>
          <div className={format === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {items.map((i) => <TestimonialCard key={i.id} item={i} showDate={false} />)}
          </div>
          {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No testimonials yet.</p>}
          {brand}
        </>
      )}
    </div>
  );
}
