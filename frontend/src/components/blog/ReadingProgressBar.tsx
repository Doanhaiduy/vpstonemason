'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const maxScrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        maxScrollableHeight > 0 ? (scrollTop / maxScrollableHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
    };

    updateProgress();

    let frameRequested = false;
    const onScroll = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        frameRequested = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[60] h-1 w-full bg-stone-200/60"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-accent-gold to-accent-gold-dark transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
