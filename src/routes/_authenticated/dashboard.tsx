import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Code2, CreditCard, FolderKanban, Globe, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquareQuote, Settings, Shield, Link2, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { accountQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ProofNest" }, { name: "robots", content: "noindex" }] }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", key: "overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/projects", key: "projects", icon: FolderKanban },
  { to: "/dashboard/testimonials", key: "testimonials", icon: MessageSquareQuote },
  { to: "/dashboard/forms", key: "forms", icon: Link2 },
  { to: "/dashboard/pages", key: "pages", icon: Globe },
  { to: "/dashboard/widgets", key: "widgets", icon: Code2 },
  { to: "/dashboard/analytics", key: "analytics", icon: BarChart3 },
  { to: "/dashboard/billing", key: "billing", icon: CreditCard },
  { to: "/dashboard/settings", key: "settings", icon: Settings },
  { to: "/dashboard/help", key: "help", icon: HelpCircle },
] as const;

function DashboardLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: account } = useQuery(accountQuery);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (account?.profile?.is_disabled)
    return <div className="flex min-h-screen items-center justify-center p-6 text-center">This account has been disabled. Please contact support.</div>;

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5 text-sidebar-accent-foreground"><Logo to="/dashboard" /></div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
            <n.icon className="h-4 w-4" />{t(`dash.${n.key}`)}
          </Link>
        ))}
        {account?.isAdmin && (
          <Link to="/admin" className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-primary hover:bg-sidebar-accent"><Shield className="h-4 w-4" />{t("dash.admin")}</Link>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{account?.profile?.display_name}</p>
        <p className="truncate text-xs opacity-70">{account?.user.email}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm opacity-80 hover:opacity-100"><LogOut className="h-4 w-4" />{t("auth.logout")}</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
          <button className="absolute right-4 top-4 text-background" onClick={() => setOpen(false)} aria-label="Close"><X /></button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
          <span className="lg:hidden"><Logo to="/dashboard" /></span>
          <div className={cn("ml-auto flex items-center gap-3")}>
            <span className="hidden rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground sm:inline">{account?.plan?.name ?? "Free"}</span>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8"><Outlet /></main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
