'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { RouteProgress } from '../ui/RouteProgress';
import { FloatingAIChat } from '../ui/FloatingAIChat';

const CLIENT_WARMUP_ROUTES = [
  '/',
  '/about',
  '/catalog',
  '/catalog/mineral',
  '/catalog/porcelain',
  '/catalog/natural',
  '/projects',
  '/showroom',
  '/blog',
  '/contact',
];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (isAdmin) return;

    const warmupKey = 'client-route-warmup-done-v1';
    if (sessionStorage.getItem(warmupKey) === '1') return;

    const targets = CLIENT_WARMUP_ROUTES.filter((href) => href !== pathname);
    if (targets.length === 0) {
      sessionStorage.setItem(warmupKey, '1');
      return;
    }

    let cancelled = false;
    const timerIds: number[] = [];

    const warmRoutes = () => {
      targets.forEach((href, index) => {
        const timerId = window.setTimeout(() => {
          if (cancelled) return;

          try {
            router.prefetch(href);
          } catch {
            // no-op
          }

          // Warm Next.js dev compiler in background for first-click responsiveness.
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
  }, [isAdmin, pathname, router]);

  return (
    <>
      <RouteProgress />
      {isAdmin ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingAIChat />
        </>
      )}
    </>
  );
}
