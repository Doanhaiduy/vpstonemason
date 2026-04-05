'use client';

import { useState } from 'react';
import { List, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogHeading } from '@/lib/blog-content';

interface TocProps {
  headings: BlogHeading[];
  activeId: string;
}

function scrollToHeading(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 110;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function TableOfContents({ headings, activeId }: TocProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
        <List className="h-4 w-4 text-accent-gold-dark" />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-700">
          On this page
        </p>
      </div>

      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                'w-full rounded-md px-2 py-2 text-left text-sm transition-colors',
                heading.level === 3 && 'pl-6',
                heading.level === 4 && 'pl-10',
                activeId === heading.id
                  ? 'bg-accent-gold/10 font-medium text-accent-gold-dark'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TableOfContentsMobile({ headings, activeId }: TocProps) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-xl xl:hidden"
        aria-label="Open table of contents"
      >
        <List className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close table of contents"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-700">
                On this page
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="max-h-[calc(70vh-70px)] space-y-1 overflow-y-auto p-3">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToHeading(heading.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full rounded-md px-2 py-2 text-left text-sm transition-colors',
                      heading.level === 3 && 'pl-5',
                      heading.level === 4 && 'pl-8',
                      activeId === heading.id
                        ? 'bg-accent-gold/10 font-medium text-accent-gold-dark'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                    )}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
