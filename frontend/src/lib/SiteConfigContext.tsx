'use client';

import React, { createContext, useContext } from 'react';
import { SiteConfig } from './site-config';

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config: SiteConfig; 
}) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
