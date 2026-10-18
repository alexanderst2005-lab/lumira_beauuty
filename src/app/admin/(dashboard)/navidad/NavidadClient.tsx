'use client';

import React, { useState, useTransition } from 'react';
import { 
  Sparkles, 
  Eye, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  Snowflake, 
  Lightbulb, 
  Gift, 
  Heart,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { ChristmasConfig } from '@/types/christmas';
import ChristmasPreviewModal from './ChristmasPreviewModal';

interface NavidadClientProps {
  initialConfig: ChristmasConfig;
}

export default function NavidadClient({ initialConfig }: NavidadClientProps) {
  const [savedConfig, setSavedConfig] = useState<ChristmasConfig>(initialConfig);
  const [formData, setFormData] = useState<ChristmasConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [, startTransition] = useTransition();

  const hasUnsavedChanges = JSON.stringify(savedConfig) !== JSON.stringify(formData);

  const handleToggle = (key: keyof Omit<ChristmasConfig, 'updatedAt'>) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveChanges = async (customData?: ChristmasConfig) => {
    const dataToSave = customData || formData;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/christmas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al guardar la configuración');
      }

      const data = await response.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setFormData(data.config);
        toast.success(
          dataToSave.enabled 
            ? '✨ ¡Modo navideño activado y guardado correctamente!' 
            : '🤍 Configuración guardada. Modo navideño desactivado.'
        );
      } else {
        throw new Error(data.error || 'No se pudo guardar la configuración');
      }
    } catch (error: any) {
      console.error('Error guardando configuración navideña:', error);
      toast.error(error.message || 'Ocurrió un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
              Temporada Navideña
            </h1>
            <span className="text-xl">🎄</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configura y personaliza la ambientación festiva «Navidad Lumira Beauty» para la tienda pública.
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!formData.enabled) {
                setFormData(prev => ({ ...prev, enabled: true }));
              }
              setIsPreviewOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-50 text-pink-700 text-sm font-semibold transition-all hover:border-pink-300 shadow-sm active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Vista previa</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveChanges()}
            disabled={isSaving || !hasUnsavedChanges}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              hasUnsavedChanges
                ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/20 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de cambios pendientes */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm text-amber-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Tienes cambios sin guardar. Haz clic en <strong>Guardar cambios</strong> para aplicarlos a la tienda pública.</span>
          </div>
          <button
            type="button"
            onClick={() => handleSaveChanges()}
            disabled={isSaving}
            className="underline font-bold hover:text-amber-950 ml-4 flex-shrink-0"
          >
            Guardar ahora
          </button>
        </div>
      )}

      {/* 1. INTERRUPTOR PRINCIPAL (ACTIVACIÓN GENERAL) */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
        formData.enabled 
          ? 'bg-gradient-to-r from-pink-50/70 via-rose-50/50 to-white border-pink-200 ring-1 ring-pink-500/20' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">
                Estado General de la Temporada
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                formData.enabled 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {formData.enabled ? '● Navidad Activada' : '○ Navidad Desactivada'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
              {formData.enabled
                ? 'La tienda pública mostrará los efectos y secciones navideñas que tengas habilitados a continuación.'
                : 'Al desactivar, la tienda regresa inmediatamente a su diseño original sin ningún rastro visual de navidad.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.enabled ? 'bg-pink-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={formData.enabled}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                formData.enabled ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. CONTROLES INDEPENDIENTES */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-sans">
            Efectos y Decoraciones Individuales
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Enciende o apaga cada efecto de forma totalmente independiente según lo desees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. Nieve animada */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Snowflake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900">Nieve animada</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Copos blancos y suaves cayendo de arriba hacia abajo con velocidad natural y sin bloquear botones ni clics.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('snow')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.snow ? 'bg-pink-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.snow}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.snow ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* B. Luces navideñas */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900">Luces navideñas</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Guirnalda luminosa superior en tonos dorado champán y rosa cálido con respiración lumínica suave.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('lights')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.lights ? 'bg-pink-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.lights}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.lights ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* C. Destellos luminosos */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900">Destellos luminosos</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pequeñas estrellas doradas y blancas que titilan delicadamente en la pantalla aportando magia y elegancia.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('sparkles')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.sparkles ? 'bg-pink-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.sparkles}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.sparkles ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* D. Sección «Regala belleza» */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900">Sección «Regala belleza»</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Muestra en la portada el bloque destacado con el botón «Descubrir productos» hacia el catálogo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('giftSection')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.giftSection ? 'bg-pink-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.giftSection}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.giftSection ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* E. Decoración navideña adicional */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex items-start justify-between gap-4 md:col-span-2">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900">Decoración festiva adicional</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pequeños distintivos y detalles estéticos festivos como el badge sutil de «Edición Navideña» en la esquina de la pantalla.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('extraDecor')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.extraDecor ? 'bg-pink-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={formData.extraDecor}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.extraDecor ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Panel Informativo de Estilo y Paleta */}
      <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 text-xs text-gray-500 space-y-2">
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
          <span>Identidad Visual: Navidad Lumira Beauty</span>
        </div>
        <p>
          Los efectos están calibrados exclusivamente para la paleta oficial de Lumira Beauty: <strong>Rosa empolvado</strong>, <strong>Dorado champán</strong>, <strong>Blanco nieve</strong> y <strong>Crema suave</strong>. No alteran los colores de marca, tipografías ni la funcionalidad del catálogo, carrito o pagos.
        </p>
      </div>

      {/* Modal de Vista Previa Real */}
      <ChristmasPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        config={formData}
        onChangeConfig={(newCfg) => setFormData(newCfg)}
        onSaveAndPublish={async () => {
          await handleSaveChanges(formData);
          setIsPreviewOpen(false);
        }}
        saving={isSaving}
      />
    </div>
  );
}
