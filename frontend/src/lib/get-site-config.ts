import siteConfig, { SiteConfig } from './site-config';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { toGoogleMapsEmbedUrl } from './google-maps';

/**
 * Get merged site config: DB (ShowroomSettings) → site-config.ts defaults
 * 
 * Call this in server components or getStaticProps to get the latest config.
 * Falls back gracefully if the API is unreachable.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  return cachedSiteConfig();
}

function mergeWithDefaults(dbSettings: any): SiteConfig {
  const fallbackMap = siteConfig.googleMapsEmbed;
  const persistedMap = String(dbSettings.googleMapsEmbed || '').trim();

  return {
    companyName: dbSettings.companyName || siteConfig.companyName,
    tagline: dbSettings.tagline || siteConfig.tagline,
    phone: dbSettings.phone || siteConfig.phone,
    email: dbSettings.email || siteConfig.email,
    address: {
      street: dbSettings.address?.street || siteConfig.address.street,
      suburb: dbSettings.address?.suburb || siteConfig.address.suburb,
      state: dbSettings.address?.state || siteConfig.address.state,
      postcode: dbSettings.address?.postcode || siteConfig.address.postcode,
    },
    siteUrl: siteConfig.siteUrl,
    apiUrl: siteConfig.apiUrl,
    openingHours: dbSettings.openingHours?.length > 0
      ? dbSettings.openingHours
      : siteConfig.openingHours,
    socialLinks: {
      facebook: dbSettings.socialLinks?.facebook ?? siteConfig.socialLinks.facebook,
      instagram: dbSettings.socialLinks?.instagram ?? siteConfig.socialLinks.instagram,
      pinterest: dbSettings.socialLinks?.pinterest ?? siteConfig.socialLinks.pinterest,
      youtube: dbSettings.socialLinks?.youtube ?? siteConfig.socialLinks.youtube,
    },
    seo: {
      titleSuffix: siteConfig.seo.titleSuffix,
      defaultDescription: dbSettings.heroSubtitle || siteConfig.seo.defaultDescription,
      ogImage: siteConfig.seo.ogImage,
      locale: siteConfig.seo.locale,
      keywords: siteConfig.seo.keywords,
    },
    hero: {
      title: dbSettings.heroTitle || siteConfig.hero.title,
      subtitle: dbSettings.heroSubtitle || siteConfig.hero.subtitle,
      cta1Text: dbSettings.heroCta1Text || siteConfig.hero.cta1Text,
      cta1Link: dbSettings.heroCta1Link || siteConfig.hero.cta1Link,
      cta2Text: dbSettings.heroCta2Text || siteConfig.hero.cta2Text,
      cta2Link: dbSettings.heroCta2Link || siteConfig.hero.cta2Link,
    },
    aboutShort: dbSettings.aboutShort || siteConfig.aboutShort,
    geo: siteConfig.geo,
    googleMapsEmbed: toGoogleMapsEmbedUrl(persistedMap, fallbackMap),
    themeColor: siteConfig.themeColor,
    aiEnabled: dbSettings.aiEnabled ?? siteConfig.aiEnabled,
  };
}

async function fetchSiteConfig(): Promise<SiteConfig> {
  const timeoutMs = Number(process.env.SITE_CONFIG_TIMEOUT_MS || 5000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${siteConfig.apiUrl}/showroom`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    if (!res.ok) return siteConfig;

    const dbSettings = await res.json();
    return mergeWithDefaults(dbSettings);
  } catch {
    return siteConfig;
  } finally {
    clearTimeout(timeout);
  }
}

const loadSiteConfig = unstable_cache(fetchSiteConfig, ['site-config'], {
  revalidate: 60,
  tags: ['site-config'],
});

const cachedSiteConfig = cache(async (): Promise<SiteConfig> => loadSiteConfig());

/**
 * Get site config synchronously (for client components)
 * Uses only file-based defaults (no DB fetch)
 */
export function getStaticSiteConfig(): SiteConfig {
  return siteConfig;
}
