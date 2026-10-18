'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink
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

  // Sincronizar cambios por postMessage directamente al iframe sin recargar
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'LUMIRA_CHRISTMAS_PREVIEW',
          config
        },
        '*'
      );
    }
  }, [config]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof Omit<ChristmasConfig, 'updatedAt'>) => {
    const updated = {
      ...config,
      [key]: !config[key]
    };
    onChangeConfig(updated);
  };

  const previewUrl = `/?preview_christmas=1&enabled=${config.enabled}&snow=${config.snow}&lights=${config.lights}&sparkles=${config.sparkles}&giftSection=${config.giftSection}&extraDecor=${config.extraDecor}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12121A] rounded-2xl shadow-2xl flex flex-col w-full max-w-[96vw] h-[95vh] overflow-hidden border border-gray-800">
        
        {/* Barra superior de control de la vista previa */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#1A1A24] text-white border-b border-gray-800">
          
          {/* Identificador y título */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">Vista Previa Real de la Tienda</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Simulación en Vivo
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden md:block">
                Esta es la página principal real de Lumira Beauty. Los cambios que pruebes aquí no afectan a tus visitantes hasta que guardes.
              </p>
            </div>
          </div>

          {/* Selector de Dispositivo */}
          <div className="flex items-center gap-1 bg-[#12121A] p-1 rounded-xl border border-gray-800">
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
              <span className="hidden sm:inline">Escritorio</span>
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
              <span className="hidden sm:inline">Tablet</span>
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
              <span className="hidden sm:inline">Móvil</span>
            </button>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLoadingIframe(true);
                setIframeKey((prev) => prev + 1);
              }}
              title="Recargar vista previa"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingIframe ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onSaveAndPublish}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-pink-600/30 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar y Publicar'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra interactiva de interruptores en tiempo real */}
        <div className="bg-[#161622] border-b border-gray-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 font-medium mr-1">Probar efectos en vivo:</span>

            {/* Interruptor Maestro */}
            <button
              type="button"
              onClick={() => toggleOption('enabled')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm ${
                config.enabled
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{config.enabled ? '🎄 Navidad: ACTIVADA' : '○ Navidad: DESACTIVADA'}</span>
            </button>

            {/* Switch Nieve */}
            <button
              type="button"
              onClick={() => toggleOption('snow')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                config.snow && config.enabled
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Nieve: {config.snow ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Luces */}
            <button
              type="button"
              onClick={() => toggleOption('lights')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                config.lights && config.enabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Luces: {config.lights ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Destellos */}
            <button
              type="button"
              onClick={() => toggleOption('sparkles')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                config.sparkles && config.enabled
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Destellos: {config.sparkles ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Regala Belleza */}
            <button
              type="button"
              onClick={() => toggleOption('giftSection')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                config.giftSection && config.enabled
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Regala Belleza: {config.giftSection ? 'ON' : 'OFF'}</span>
            </button>

            {/* Switch Decoración Extra */}
            <button
              type="button"
              onClick={() => toggleOption('extraDecor')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                config.extraDecor && config.enabled
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Detalles: {config.extraDecor ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="text-gray-400 text-[11px] hidden lg:block">
            {config.enabled 
              ? '✨ Modo navideño activado en la simulación.' 
              : '🤍 Navidad desactivada; la tienda se muestra con su aspecto original.'}
          </div>
        </div>

        {/* Área del iframe con el tamaño del dispositivo seleccionado */}
        <div className="flex-1 overflow-hidden bg-[#0A0A0F] p-2 sm:p-4 flex items-center justify-center relative">
          {isLoadingIframe && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0F]/80 z-20 gap-3 text-gray-400">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
              <span className="text-sm font-medium">Cargando la tienda real de Lumira Beauty...</span>
            </div>
          )}

          <div
            className={`transition-all duration-300 h-full flex flex-col items-center justify-center ${
              device === 'mobile'
                ? 'w-[390px]'
                : device === 'tablet'
                ? 'w-[768px]'
                : 'w-full'
            }`}
          >
            <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-800 relative">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewUrl}
                title="Vista previa real de la tienda Lumira Beauty"
                className="w-full h-full border-0 bg-white"
                onLoad={() => {
                  setIsLoadingIframe(false);
                  // Enviar estado actual tras cargar
                  if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      {
                        type: 'LUMIRA_CHRISTMAS_PREVIEW',
                        config
                      },
                      '*'
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 bg-[#1A1A24] border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-2">
            <span>Puedes navegar e interactuar con la tienda tal cual como la ven tus clientes.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}
