'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Eye, 
  RefreshCw, 
  Save, 
  Snowflake, 
  Lightbulb, 
  Sparkles, 
  Gift, 
  Heart,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ChristmasConfig } from '@/types/christmas';

interface ChristmasPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChristmasConfig;
  onChangeConfig: (newConfig: ChristmasConfig) => void;
  onSaveAndPublish: () => void;
  saving: boolean;
}

export default function ChristmasPreviewModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onSaveAndPublish,
  saving
}: ChristmasPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Función para enviar la configuración actual al iframe
  const sendConfigToIframe = useCallback((cfg: ChristmasConfig) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'LUMIRA_CHRISTMAS_PREVIEW',
            config: cfg
          },
          '*'
        );
      } catch (err) {
        console.error('Error posting message to iframe:', err);
      }
    }
  }, []);

  // Escuchar cuando el iframe se monta y solicita la configuración inicial
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LUMIRA_IFRAME_READY') {
        setIsLoadingIframe(false);
        sendConfigToIframe(config);
      }
    };

    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [config, sendConfigToIframe]);

  // Sincronizar en tiempo real cuando el administrador cambia cualquier toggle
  useEffect(() => {
    sendConfigToIframe(config);
  }, [config, sendConfigToIframe]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof Omit<ChristmasConfig, 'updatedAt'>) => {
    const updated = {
      ...config,
      [key]: !config[key]
    };
    onChangeConfig(updated);
  };

  const previewUrl = `/?preview_christmas=1&enabled=${config.enabled}&snow=${config.snow}&lights=${config.lights}&sparkles=${config.sparkles}&giftSection=${config.giftSection}&extraDecor=${config.extraDecor}&t=${iframeKey}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12121A] rounded-none sm:rounded-2xl shadow-2xl flex flex-col w-full sm:max-w-[98vw] h-full sm:h-[96vh] overflow-hidden border-0 sm:border border-gray-800">
        
        {/* Barra superior de control de la vista previa (Optimizada para móvil y desktop) */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#1A1A26] text-white border-b border-gray-800 flex-shrink-0">
          
          {/* Identificador y título */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 flex-shrink-0">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-semibold text-xs sm:text-base text-white truncate">
                  Vista Previa Lumira
                </h3>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 flex-shrink-0">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden md:block">
                Tienda real. Modifica los interruptores y observa el cambio en 0 ms.
              </p>
            </div>
          </div>

          {/* Selector de Dispositivo (Solo visible en pantallas medianas y grandes, en cel ya estás en móvil) */}
          <div className="hidden md:flex items-center gap-1 bg-[#12121A] p-1 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                device === 'desktop'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Escritorio</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                device === 'tablet'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                device === 'mobile'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil</span>
            </button>
          </div>

          {/* Acciones principales compactas */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsLoadingIframe(true);
                setIframeKey((prev) => prev + 1);
              }}
              title="Recargar vista previa"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoadingIframe ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onSaveAndPublish}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-pink-600/30 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{saving ? 'Guardando...' : 'Publicar'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Cerrar vista previa"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Barra interactiva de interruptores: Con scroll horizontal suave en móvil (no apeñuscado) */}
        <div className="bg-[#161624] border-b border-gray-800 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none flex-shrink-0">
          <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap flex-shrink-0">
            {/* INTERRUPTOR PRINCIPAL */}
            <button
              type="button"
              onClick={() => toggleOption('enabled')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm flex-shrink-0 whitespace-nowrap ${
                config.enabled
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white ring-2 ring-emerald-400/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{config.enabled ? '🎄 Navidad: ON' : '○ Navidad: OFF'}</span>
            </button>

            <div className="h-4 w-[1px] bg-gray-700 mx-0.5 flex-shrink-0" />

            {/* Switch Nieve */}
            <button
              type="button"
              onClick={() => toggleOption('snow')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                config.enabled && config.snow
                  ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40 ring-1 ring-blue-500/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-700/60'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-blue-400" />
              <span>Nieve: {config.snow ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Luces */}
            <button
              type="button"
              onClick={() => toggleOption('lights')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                config.enabled && config.lights
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 ring-1 ring-amber-500/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-700/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Luces: {config.lights ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Destellos */}
            <button
              type="button"
              onClick={() => toggleOption('sparkles')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                config.enabled && config.sparkles
                  ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 ring-1 ring-purple-500/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-700/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Destellos: {config.sparkles ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Regala Belleza */}
            <button
              type="button"
              onClick={() => toggleOption('giftSection')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                config.enabled && config.giftSection
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 ring-1 ring-rose-500/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-700/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-rose-400" />
              <span>Regalos: {config.giftSection ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Decoración Extra */}
            <button
              type="button"
              onClick={() => toggleOption('extraDecor')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                config.enabled && config.extraDecor
                  ? 'bg-pink-500/25 text-pink-200 border border-pink-400/40 ring-1 ring-pink-500/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 border border-gray-700/60'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Detalles: {config.extraDecor ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs flex-shrink-0">
            {config.enabled ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Navidad activa en vivo</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tienda original</span>
              </span>
            )}
          </div>
        </div>

        {/* Área del iframe de la tienda real: 100% fluida y limpia */}
        <div className="flex-1 overflow-hidden bg-[#0A0A0F] p-0 sm:p-3 flex items-center justify-center relative">
          {isLoadingIframe && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]/90 z-20 gap-3 text-gray-400">
              <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500 animate-spin" />
              <span className="text-xs sm:text-sm font-medium">Cargando tienda Lumira Beauty...</span>
            </div>
          )}

          <div
            className={`transition-all duration-300 h-full flex flex-col items-center justify-center w-full ${
              device === 'mobile'
                ? 'sm:max-w-[400px]'
                : device === 'tablet'
                ? 'sm:max-w-[768px]'
                : 'w-full'
            }`}
          >
            <div className="w-full h-full bg-white rounded-none sm:rounded-xl shadow-2xl overflow-hidden border-0 sm:border border-gray-800 relative">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewUrl}
                title="Vista previa real de la tienda Lumira Beauty"
                className="w-full h-full border-0 bg-white"
                onLoad={() => {
                  setIsLoadingIframe(false);
                  sendConfigToIframe(config);
                }}
              />
            </div>
          </div>
        </div>

        {/* Pie del modal compacto */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#1A1A26] border-t border-gray-800 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-gray-400 hidden sm:inline">
            {config.enabled
              ? '✨ Nieve, luces y banners activos en vivo. Desliza para explorar la tienda completa.'
              : '🤍 Navidad apagada. Pulsa «🎄 Navidad: ON» arriba para encender los efectos.'}
          </span>
          <span className="text-gray-400 sm:hidden text-[11px]">
            {config.enabled ? '✨ Navidad Activa' : '🤍 Diseño Normal'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
