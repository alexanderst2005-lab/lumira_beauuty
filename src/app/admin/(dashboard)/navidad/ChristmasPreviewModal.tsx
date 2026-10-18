'use client';

import React, { useState } from 'react';
import { X, Laptop, Tablet, Smartphone, Sparkles, Gift, Eye } from 'lucide-react';
import { ChristmasConfig } from '@/types/christmas';
import ChristmasCanvasEffects from '@/components/christmas/ChristmasCanvasEffects';
import ChristmasLights from '@/components/christmas/ChristmasLights';
import ChristmasExtraDecor from '@/components/christmas/ChristmasExtraDecor';

interface ChristmasPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChristmasConfig;
  onSaveAndPublish: () => void;
  saving: boolean;
}

export default function ChristmasPreviewModal({
  isOpen,
  onClose,
  config,
  onSaveAndPublish,
  saving
}: ChristmasPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-6xl h-[92vh] overflow-hidden border border-gray-100">
        {/* Barra superior de control de la vista previa */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-gray-900 text-white border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">Vista Previa Navideña</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Simulación sin publicar
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Comprueba en tiempo real cómo verán la tienda tus clientes con la configuración actual.
              </p>
            </div>
          </div>

          {/* Selector de Dispositivo */}
          <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
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

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveAndPublish}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar y Publicar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen de efectos activos en la vista previa */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Efectos en esta vista:</span>
          <span className={`px-2 py-0.5 rounded-md font-medium ${config.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
            {config.enabled ? '● Temporada Activada' : '○ Temporada Desactivada'}
          </span>
          {config.enabled && (
            <>
              <span className={`px-2 py-0.5 rounded-md font-medium ${config.snow ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                ❄️ Nieve: {config.snow ? 'Sí' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${config.lights ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-400'}`}>
                💡 Luces: {config.lights ? 'Sí' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${config.sparkles ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-400'}`}>
                ✨ Destellos: {config.sparkles ? 'Sí' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${config.giftSection ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-400'}`}>
                🎁 Regala Belleza: {config.giftSection ? 'Sí' : 'No'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${config.extraDecor ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                🎀 Decoración Extra: {config.extraDecor ? 'Sí' : 'No'}
              </span>
            </>
          )}
        </div>

        {/* Área del lienzo de previsualización interactiva */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-2 sm:p-6 flex items-start justify-center">
          <div
            className={`transition-all duration-300 relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px] ${
              device === 'mobile'
                ? 'w-[375px]'
                : device === 'tablet'
                ? 'w-[768px]'
                : 'w-full max-w-5xl'
            }`}
          >
            {/* Efectos navideños activos dentro del marco */}
            {config.enabled && (
              <>
                {(config.snow || config.sparkles) && (
                  <ChristmasCanvasEffects
                    showSnow={config.snow}
                    showSparkles={config.sparkles}
                  />
                )}
                {config.lights && <ChristmasLights />}
                {config.extraDecor && <ChristmasExtraDecor />}
              </>
            )}

            {/* Simulación visual de la tienda Lumira Beauty */}
            {/* 1. Header de la tienda */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
              <div className="font-heading font-bold text-xl text-txt">
                Lumira <span className="text-pink-500 font-sans text-xs tracking-widest font-semibold uppercase">Beauty</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-txt-secondary">
                <span className="hidden sm:inline">Catálogo</span>
                <span className="hidden sm:inline">Skincare</span>
                <span className="hidden sm:inline">Pestañas</span>
                <span className="p-2 rounded-full bg-rose-50 text-pink-600 font-bold">🛒 0</span>
              </div>
            </div>

            {/* 2. Hero banner simulado con estética de la tienda */}
            <div className="relative bg-gradient-to-r from-[#FFF0F5] via-[#FFF9FB] to-[#FFF5F0] py-14 px-6 text-center border-b border-[#F5E6EC]">
              <span className="inline-block px-3 py-1 rounded-full bg-white/80 border border-pink-200 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
                Lujo & Cuidado Femenino
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-medium text-txt mb-2">
                Realza tu belleza natural
              </h1>
              <p className="text-txt-secondary text-sm max-w-md mx-auto">
                Cosméticos, skincare y pestañas premium seleccionados especialmente para ti.
              </p>
            </div>

            {/* 3. Sección "Regala belleza" (si está activa) */}
            {config.enabled && config.giftSection && (
              <div className="py-10 px-6 bg-gradient-to-b from-[#FFFDF9] via-[#FFF5F8] to-white border-y border-[#F7E6EC] text-center">
                <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#F5DFE8] shadow-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F6] border border-[#FAD0E2] text-[11px] font-semibold text-[#C4437B] uppercase tracking-wider mb-3">
                    <Gift className="w-3 h-3 text-[#E5A852]" />
                    <span>Temporada Especial</span>
                    <Sparkles className="w-3 h-3 text-[#E5A852]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-medium text-txt mb-2">
                    Esta Navidad, <span className="italic text-gradient bg-gradient-to-r from-[#D6336C] via-[#FF5C9D] to-[#E6A64C] bg-clip-text text-transparent">regala belleza</span>
                  </h2>
                  <p className="text-txt-secondary text-xs sm:text-sm max-w-md mx-auto mb-5">
                    Encuentra ese detalle especial y sorprende con fragancias y productos que enamoran.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E75480] via-[#FF5C9D] to-[#E6A64C] text-white text-xs font-medium shadow-md shadow-pink-500/20"
                  >
                    <span>Descubrir productos</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Mini catálogo simulado */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-display font-medium text-txt">Productos Destacados</h3>
                <p className="text-xs text-txt-secondary">Calidad y elegancia en cada detalle</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center text-center">
                    <div className="w-full aspect-square bg-rose-100/50 rounded-lg mb-2 flex items-center justify-center text-rose-400 text-xs">
                      Foto de Producto
                    </div>
                    <span className="font-medium text-xs text-txt truncate w-full">Producto Lumira #{num}</span>
                    <span className="text-pink-600 font-bold text-xs mt-1">$45.000</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Footer simulado */}
            <div className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-xs mt-6">
              <p className="text-gray-300 font-medium mb-1">Lumira Beauty © 2026</p>
              <p className="text-[11px] text-gray-500">Envíos a todo Colombia • Pagos Seguros</p>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {config.enabled
              ? '✨ Modo navideño activo en la simulación.'
              : '⚠️ El modo navideño está apagado; la tienda se muestra con su aspecto original.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}
