import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { getPublicPage, recordView } from "@/lib/public.functions";
import { Stars } from "@/components/Stars";
import { TestimonialCard } from "@/components/TestimonialCard";
import { LogoMark } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const PER_PAGE = 12;

export const Route = createFileRoute("/p/$slug")({
  validateSearch: z.object({ page: z.number().int().min(0).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 0 }),
  loader: async ({ params, deps }) => {
    if (!/^[a-z0-9][a-z0-9-]{2,48}$/.test(params.slug)) throw notFound();
    const data = await getPublicPage({ data: { slug: params.slug, page: deps.page, limit: PER_PAGE } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable — ProofNest" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.project.name} — Customer testimonials`;
    const desc = loaderData.stats.count > 0
      ? `Rated ${loaderData.stats.average}/5 from ${loaderData.stats.count} verified testimonials.`
      : loaderData.project.description ?? `Testimonials for ${loaderData.project.name}.`;
    const meta = [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData.project.logo_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.project.logo_url }, { name: "twitter:image", content: loaderData.project.logo_url });
    }
    return { meta };
  },
  notFoundComponent: () => {
    const { t } = useI18n();
    return <div className="flex min-h-screen items-center justify-center p-6 text-muted-foreground">{t("public.notFound")}</div>;
  },
  component: PublicPage,
});

function PublicPage() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { page = 0 } = Route.useSearch();
  const { t, locale } = useI18n();
  const { project, stats, items } = data;
  const totalPages = Math.max(1, Math.ceil(stats.count / PER_PAGE));

  useEffect(() => {
    recordView({ data: { slug, kind: "page_view" } }).catch(() => {});
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border" style={{ backgroundImage: `linear-gradient(180deg, ${project.primary_color}14, transparent)` }}>
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
          <div className="flex justify-end"><LanguageSwitcher /></div>
          <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              {project.logo_url ? <img src={project.logo_url} alt={project.name} className="h-16 w-16 rounded-xl border border-border bg-card object-contain p-1" /> : <span className="flex h-16 w-16 items-center justify-center rounded-xl font-display text-2xl font-bold text-primary-foreground" style={{ background: project.primary_color }}>{project.name[0]}</span>}
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {project.description && <p className="mt-1 max-w-xl text-muted-foreground">{project.description}</p>}
                {project.website_url && <a href={project.website_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">{project.website_url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("public.average")}</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-display text-3xl font-bold">{stats.count ? stats.average : "–"}</span>
                <div><Stars value={stats.average} /><p className="mt-0.5 text-xs text-muted-foreground">{t("public.reviews", { n: stats.count })}</p></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t("public.empty")}</p>
        ) : (
          <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
            {items.map((i) => <TestimonialCard key={i.id} item={i} locale={locale} />)}
          </div>
        )}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3">
            <Button asChild variant="outline" size="sm" disabled={page === 0}><Link to="/p/$slug" params={{ slug }} search={{ page: Math.max(0, page - 1) }}>{t("common.previous")}</Link></Button>
            <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
            <Button asChild variant="outline" size="sm" disabled={page + 1 >= totalPages}><Link to="/p/$slug" params={{ slug }} search={{ page: Math.min(totalPages - 1, page + 1) }}>{t("common.next")}</Link></Button>
          </nav>
        )}
        <div className="mt-12 text-center">
          <Button asChild variant="outline"><Link to="/c/$slug" params={{ slug }}>{t("public.leave")}</Link></Button>
        </div>
        {project.show_branding && (
          <a href="/" className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><LogoMark className="h-4 w-4" />{t("public.poweredBy")}</a>
        )}
      </main>
    </div>
  );
}
