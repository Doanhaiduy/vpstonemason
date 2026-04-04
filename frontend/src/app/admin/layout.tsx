'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Gem, FolderOpen, Briefcase, MessageSquare,
  FileText, Settings, LogOut, Menu, X, ChevronRight, ExternalLink,
  Layers,
  Sparkles,
  Shield,
  Loader2,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Admin Accounts', icon: Shield, adminOnly: true },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/ranges', label: 'Ranges', icon: Layers },
  { href: '/admin/stones', label: 'Products', icon: Gem },
  { href: '/admin/projects', label: 'Projects', icon: Briefcase },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/settings/showroom', label: 'Settings', icon: Settings },
  { href: '/admin/settings/ai', label: 'AI Config', icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vpstonemason.vercel.app';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname.startsWith('/admin/login');

  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your showroom activity' },
    stones: { title: 'Products', subtitle: 'Manage catalog products under range and category' },
    categories: { title: 'Categories', subtitle: 'Manage top-level catalog groups' },
    ranges: { title: 'Ranges', subtitle: 'Manage mid-level catalog groups under categories' },
    projects: { title: 'Projects', subtitle: 'Showcase completed installations' },
    enquiries: { title: 'Enquiries', subtitle: 'Track customer requests and responses' },
    users: { title: 'Admin Accounts', subtitle: 'Create and manage manager accounts' },
    blog: { title: 'Blog Posts', subtitle: 'Publish and edit marketing content' },
    showroom: { title: 'Showroom Settings', subtitle: 'Control company, homepage, SEO and social data' },
    ai: { title: 'AI Configuration', subtitle: 'Set AI behavior and guardrails' },
    create: { title: 'Create', subtitle: 'Add a new item to your system' },
    edit: { title: 'Edit', subtitle: 'Update selected content and settings' },
  };

  useEffect(() => {
    if (isLoginRoute) {
      setIsAuthReady(true);
      setIsAuthenticated(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (!token) {
      setIsAuthenticated(false);
      setIsAuthReady(true);
      router.replace('/admin/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }

    setIsAuthenticated(true);
    setIsAuthReady(true);
  }, [isLoginRoute, pathname, router]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!user) return;

    const warmupKey = 'admin-route-warmup-done-v1';
    if (sessionStorage.getItem(warmupKey) === '1') return;

    const warmupTargets = Array.from(
      new Set([
        '/admin',
        '/admin/dashboard',
        ...sidebarLinks
          .filter((link: any) => !link.adminOnly || user.role === 'admin')
          .map((link) => link.href),
      ]),
    ).filter((href) => href !== pathname);

    if (warmupTargets.length === 0) {
      sessionStorage.setItem(warmupKey, '1');
      return;
    }

    let cancelled = false;
    const timerIds: number[] = [];

    const warmRoutes = () => {
      warmupTargets.forEach((href, index) => {
        const timerId = window.setTimeout(() => {
          if (cancelled) return;

          // Ask Next router to prefetch chunks when possible.
          try {
            router.prefetch(href);
          } catch {
            // no-op
          }

          // Trigger a background request so dev server compiles route before user clicks.
          void fetch(href).catch(() => {
            // no-op
          });
        }, 180 * index);

        timerIds.push(timerId);
      });

      sessionStorage.setItem(warmupKey, '1');
    };

    const idleCallback = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cancelIdleCallback = (window as any).cancelIdleCallback as
      | ((id: number) => void)
      | undefined;

    const idleId = idleCallback
      ? idleCallback(warmRoutes, { timeout: 1200 })
      : window.setTimeout(warmRoutes, 220);

    return () => {
      cancelled = true;
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
      if (idleCallback && cancelIdleCallback) {
        cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [pathname, router, user]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.replace('/admin/login');
  };

  if (isLoginRoute) return <>{children}</>;

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  const pageKey = pathname.split('/').pop() || 'dashboard';
  const pageTitle = pageMeta[pageKey]?.title || pageKey.replace(/-/g, ' ');
  const visibleSidebarLinks = sidebarLinks.filter((link: any) => {
    if (!link.adminOnly) return true;
    return user?.role === 'admin';
  });
  const mainLinks = visibleSidebarLinks.filter((link) => !link.href.startsWith('/admin/settings'));
  const systemLinks = visibleSidebarLinks.filter((link) => link.href.startsWith('/admin/settings'));

  return (
    <div className="admin-shell min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/90 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm tracking-tight">vpstonemason</span>
              <span className="block text-[10px] text-slate-400 -mt-0.5">Admin Console</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em] font-semibold px-3 pt-3 pb-1.5">Main Menu</p>
          {mainLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.45)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] transition-transform ${isActive ? '' : 'group-hover:scale-105'}`} />
                {link.label}
                {link.label === 'Enquiries' && (
                  <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">!</span>
                )}
              </Link>
            );
          })}
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em] font-semibold px-3 pt-5 pb-1.5">System</p>
          {systemLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.45)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] transition-transform ${isActive ? '' : 'group-hover:scale-105'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 flex-shrink-0 bg-white/[0.02]">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl w-full transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                  <span>Admin Workspace</span>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-slate-600 font-semibold">{pageTitle}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={siteUrl}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 px-3 py-2 hover:bg-indigo-50 rounded-lg transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Site
              </Link>

              {user && (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-medium text-slate-700 leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize leading-none mt-1">
                      {user.role || 'admin'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1360px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
