'use client';

import { useState } from 'react';
import {
  Share2,
  Link2,
  Check,
  Facebook,
  Linkedin,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type ShareVariant = 'default' | 'floating';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  variant?: ShareVariant;
  className?: string;
}

function buildShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };
}

export function ShareButtons({
  title,
  url,
  description,
  variant = 'default',
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (!('share' in navigator)) return;
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // Ignore cancellation and unsupported edge cases.
    }
  };

  const openWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=640,height=520');
  };

  const iconButtons = (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
        title={copied ? 'Copied' : 'Copy link'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => openWindow(links.x)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
        title="Share on X"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openWindow(links.facebook)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openWindow(links.linkedin)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openWindow(links.whatsapp)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
    </>
  );

  if (variant === 'floating') {
    return (
      <>
        <div
          className={cn(
            'fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 rounded-xl border border-stone-200 bg-white p-2 shadow-lg xl:flex',
            className,
          )}
        >
          {'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
          {iconButtons}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-2 shadow-2xl backdrop-blur xl:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-2">
            {'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            {iconButtons}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {'share' in navigator && (
        <Button
          type="button"
          variant="clientOutline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}
      {iconButtons}
    </div>
  );
}
