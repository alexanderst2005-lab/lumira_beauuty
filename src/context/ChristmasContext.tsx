'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ChristmasConfig, DEFAULT_CHRISTMAS_CONFIG } from '@/types/christmas';

interface ChristmasContextType {
  config: ChristmasConfig;
  previewConfig: ChristmasConfig | null;
  activeConfig: ChristmasConfig;
  isChristmasActive: boolean;
  isLoading: boolean;
  setPreviewConfig: (cfg: ChristmasConfig | null) => void;
  refreshConfig: () => Promise<void>;
}

const ChristmasContext = createContext<ChristmasContextType>({
  config: DEFAULT_CHRISTMAS_CONFIG,
  previewConfig: null,
  activeConfig: DEFAULT_CHRISTMAS_CONFIG,
  isChristmasActive: false,
  isLoading: true,
  setPreviewConfig: () => {},
  refreshConfig: async () => {},
});

export function ChristmasProvider({
  children,
  initialConfig
}: {
  children: ReactNode;
  initialConfig?: ChristmasConfig | null;
}) {
  const [config, setConfig] = useState<ChristmasConfig>(initialConfig || DEFAULT_CHRISTMAS_CONFIG);
  const [previewConfig, setPreviewConfig] = useState<ChristmasConfig | null>(null);
  const [isLoading, setIsLoading] = useState(!initialConfig);

  const refreshConfig = async () => {
    try {
      const res = await fetch('/api/christmas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (e) {
      console.error('Error refreshing christmas config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialConfig) {
      refreshConfig();
    }
  }, [initialConfig]);

  // Soporte de previsualización en vivo (mediante query param o postMessage)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Leer parámetros iniciales si se carga dentro del iframe con preview_christmas=1
    try {
      const search = window.location.search;
      if (search && search.includes('preview_christmas=1')) {
        const params = new URLSearchParams(search);
        const previewCfg: ChristmasConfig = {
          enabled: params.get('enabled') === 'true',
          snow: params.get('snow') !== 'false',
          lights: params.get('lights') !== 'false',
          sparkles: params.get('sparkles') !== 'false',
          giftSection: params.get('giftSection') !== 'false',
          extraDecor: params.get('extraDecor') !== 'false',
        };
        setPreviewConfig(previewCfg);
      }
    } catch (e) {
      console.error('Error reading preview query params:', e);
    }

    // 2. Escuchar cambios instantáneos por postMessage desde el modal de administración
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LUMIRA_CHRISTMAS_PREVIEW' && event.data?.config) {
        setPreviewConfig({ ...event.data.config });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const activeConfig = useMemo(() => {
    return previewConfig || config;
  }, [previewConfig, config]);

  const isChristmasActive = Boolean(activeConfig?.enabled);

  const value = useMemo(
    () => ({
      config,
      previewConfig,
      activeConfig,
      isChristmasActive,
      isLoading,
      setPreviewConfig,
      refreshConfig,
    }),
    [config, previewConfig, activeConfig, isChristmasActive, isLoading]
  );

  return (
    <ChristmasContext.Provider value={value}>
      {children}
    </ChristmasContext.Provider>
  );
}

export function useChristmas() {
  const context = useContext(ChristmasContext);
  if (!context) {
    throw new Error('useChristmas must be used within a ChristmasProvider');
  }
  return context;
}
