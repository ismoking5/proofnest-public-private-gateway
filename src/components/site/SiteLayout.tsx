import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/features" as const, label: t("nav.features") },
    { to: "/how-it-works" as const, label: t("nav.how") },
    { to: "/pricing" as const, label: t("nav.pricing") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button asChild><Link to="/dashboard">{t("nav.dashboard")}</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">{t("nav.login")}</Link></Button>
              <Button asChild variant="hero"><Link to="/signup">{t("nav.signup")}</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-1 font-medium">{l.label}</Link>
            ))}
            {user ? (
              <Button asChild><Link to="/dashboard">{t("nav.dashboard")}</Link></Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link to="/login">{t("nav.login")}</Link></Button>
                <Button asChild variant="hero"><Link to="/signup">{t("nav.signup")}</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("brand.slogan")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground">{t("footer.terms")}</Link>
          <Link to="/privacy" className="hover:text-foreground">{t("footer.privacy")}</Link>
          <Link to="/refund-policy" className="hover:text-foreground">{t("footer.refund")}</Link>
          <Link to="/contact" className="hover:text-foreground">{t("footer.contact")}</Link>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ProofNest. {t("footer.rights")}
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-hero">
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-16 text-center">
        <h1 className="animate-rise text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}
