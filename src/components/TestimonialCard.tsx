import { Stars } from "./Stars";

export type PublicItem = { id: string; display_name: string; company_name: string | null; rating: number; content: string; photo_url: string | null; approved_at: string };

export function TestimonialCard({ item, showDate = true, locale = "en" }: { item: PublicItem; showDate?: boolean; locale?: string }) {
  const initials = item.display_name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <figure className="break-inside-avoid rounded-xl border border-border bg-card p-5 shadow-card">
      <Stars value={item.rating} size={15} />
      <blockquote className="mt-3 whitespace-pre-line text-sm leading-relaxed">“{item.content}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {item.photo_url ? (
          <img src={item.photo_url} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{initials}</span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.display_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {item.company_name}
            {item.company_name && showDate ? " · " : ""}
            {showDate && new Date(item.approved_at).toLocaleDateString(locale, { month: "short", year: "numeric" })}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
