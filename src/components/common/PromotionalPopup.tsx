'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { PromotionalCampaign } from '@/types/campaign';

interface PromotionalPopupProps {
  forcedCampaign?: PromotionalCampaign | null;
  isPreview?: boolean;
  onClosePreview?: () => void;
}

export default function PromotionalPopup({
  forcedCampaign,
  isPreview = false,
  onClosePreview
}: PromotionalPopupProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(forcedCampaign || null);
  const [isOpen, setIsOpen] = useState<boolean>(Boolean(forcedCampaign));
  const [hasChecked, setHasChecked] = useState<boolean>(Boolean(forcedCampaign));

  const markAsSeen = useCallback((camp: PromotionalCampaign) => {
    if (isPreview) return;
    try {
      const storageKey = `lumira_promo_seen_${camp.id}_${camp.updatedAt || 'v1'}`;
      if (camp.frequency === 'once_per_session') {
        sessionStorage.setItem(storageKey, 'true');
      } else if (camp.frequency === 'every_24_hours') {
        localStorage.setItem(storageKey, Date.now().toString());
      }
    } catch (e) {
      // Manejar modo incógnito estricto sin errores
    }
  }, [isPreview]);

  const shouldShowCampaign = useCallback((camp: PromotionalCampaign): boolean => {
    if (isPreview) return true;
    try {
      // Si es el administrador navegando en la tienda, permitir ver siempre el popup para pruebas inmediatas
      if (typeof document !== 'undefined' && document.cookie.includes('admin_session=authenticated')) {
        return true;
      }

      const storageKey = `lumira_promo_seen_${camp.id}_${camp.updatedAt || 'v1'}`;
      if (camp.frequency === 'once_per_session') {
        return !sessionStorage.getItem(storageKey);
      }
      if (camp.frequency === 'every_24_hours') {
        const lastSeen = localStorage.getItem(storageKey);
        if (!lastSeen) return true;
        const timeDiff = Date.now() - parseInt(lastSeen, 10);
        return timeDiff > 24 * 60 * 60 * 1000;
      }
      if (camp.frequency === 'always') {
        return true;
      }
    } catch (e) {
      return true;
    }
    return true;
  }, [isPreview]);

  // Si se pasa una campaña forzada (modo preview en admin)
  useEffect(() => {
    if (forcedCampaign) {
      setCampaign(forcedCampaign);
      setIsOpen(true);
      setHasChecked(true);
    }
  }, [forcedCampaign]);

  // Fetch de la campaña activa en la tienda pública
  useEffect(() => {
    if (forcedCampaign || isPreview) return;

    let isMounted = true;
    async function fetchActiveCampaign() {
      try {
        const res = await fetch('/api/campaigns/active', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (!res.ok) {
          if (isMounted) {
            setCampaign(null);
            setIsOpen(false);
          }
          return;
        }
        const data = await res.json();
        if (data.campaign && isMounted) {
          if (shouldShowCampaign(data.campaign)) {
            setCampaign(data.campaign);
            // Pequeño retardo elegante de 600ms para permitir que la página cargue suavemente
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 600);
            return () => clearTimeout(timer);
          } else {
            setIsOpen(false);
          }
        } else if (isMounted) {
          // Si la campaña fue eliminada o no está activa, cerrar y limpiar inmediatamente
          setCampaign(null);
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Error fetching promo campaign:', err);
        if (isMounted) {
          setCampaign(null);
          setIsOpen(false);
        }
      } finally {
        if (isMounted) setHasChecked(true);
      }
    }

    fetchActiveCampaign();

    return () => {
      isMounted = false;
    };
  }, [forcedCampaign, isPreview, shouldShowCampaign]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (campaign) {
      markAsSeen(campaign);
    }
    setIsOpen(false);
    if (onClosePreview) {
      onClosePreview();
    }
  };

  const handleButtonClick = () => {
    if (!campaign) return;
    markAsSeen(campaign);
    setIsOpen(false);
    if (onClosePreview) {
      onClosePreview();
    }

    if (campaign.buttonUrl) {
      if (campaign.buttonUrl.startsWith('http')) {
        window.open(campaign.buttonUrl, '_blank', 'noopener,noreferrer');
      } else {
        router.push(campaign.buttonUrl);
      }
    }
  };

  if (!hasChecked || !isOpen || !campaign) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
          {/* Backdrop con desenfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-lg md:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-pink-100/60 my-auto max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
          >
            {/* Botón de cierre accesible */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/85 text-gray-700 hover:text-black hover:bg-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 group"
              aria-label="Cerrar anuncio promocional"
            >
              <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* Contenedor con scroll interno si en móviles es muy alto */}
            <div className="overflow-y-auto overscroll-contain flex flex-col">
              {/* Imagen promocional destacada */}
              {campaign.imageUrl && (
                <div className="relative w-full h-48 sm:h-64 bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                  
                  {/* Badge flotante sobre la imagen si está configurado */}
                  {campaign.promoBadge && (
                    <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg tracking-wide uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      {campaign.promoBadge}
                    </div>
                  )}
                </div>
              )}

              {/* Cuerpo del Popup */}
              <div className="p-6 sm:p-8 flex flex-col text-center">
                {/* Badge en caso de que no haya imagen */}
                {!campaign.imageUrl && campaign.promoBadge && (
                  <div className="inline-flex items-center justify-center gap-1.5 self-center mb-3 px-3.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold tracking-wide uppercase border border-pink-100">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    {campaign.promoBadge}
                  </div>
                )}

                {/* Título de la campaña */}
                <h2
                  id="promo-popup-title"
                  className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug"
                >
                  {campaign.title}
                </h2>

                {/* Descripción */}
                {campaign.description && (
                  <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                    {campaign.description}
                  </p>
                )}

                {/* Botón de acción opcional */}
                {campaign.buttonText && campaign.buttonUrl && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <button
                      onClick={handleButtonClick}
                      className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-medium text-sm sm:text-base shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <span>{campaign.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={handleClose}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1 transition-colors py-1"
                    >
                      Quizás más tarde
                    </button>
                  </div>
                )}

                {/* Si no hay botón, botón de cerrar elegante */}
                {(!campaign.buttonText || !campaign.buttonUrl) && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleClose}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                    >
                      Entendido
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
