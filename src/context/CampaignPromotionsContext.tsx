'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PromotionalCampaign, CampaignProductDiscount } from '@/types/campaign';
import { Product } from '@/types';

interface ProductDiscountResult {
  hasDiscount: boolean;
  finalPrice: number;
  originalPrice: number;
  discountPercent: number;
  savings: number;
  discountSource?: 'campaign' | 'individual' | 'best_offer';
  campaignTitle?: string;
}

interface CampaignPromotionsContextType {
  activeCampaign: PromotionalCampaign | null;
  activeDiscounts: Record<string, CampaignProductDiscount>;
  getProductDiscount: (productId: string, price: number, individualOriginalPrice?: number) => ProductDiscountResult;
  applyDiscountToProduct: (product: Product) => Product;
  refreshCampaigns: () => Promise<void>;
  isLoading: boolean;
}

const defaultContextValue: CampaignPromotionsContextType = {
  activeCampaign: null,
  activeDiscounts: {},
  getProductDiscount: (_id: string, basePrice: number, individualOriginalPrice?: number) => {
    const hasInd = Boolean(individualOriginalPrice && individualOriginalPrice > basePrice);
    const orig = hasInd && individualOriginalPrice ? individualOriginalPrice : basePrice;
    const sav = hasInd ? orig - basePrice : 0;
    return {
      hasDiscount: hasInd,
      finalPrice: basePrice,
      originalPrice: orig,
      discountPercent: hasInd ? Math.round((sav / orig) * 100) : 0,
      savings: sav
    };
  },
  applyDiscountToProduct: (product: Product) => product,
  refreshCampaigns: async () => {},
  isLoading: false
};

const CampaignPromotionsContext = createContext<CampaignPromotionsContextType>(defaultContextValue);

export function CampaignPromotionsProvider({ children }: { children: React.ReactNode }) {
  const [activeCampaign, setActiveCampaign] = useState<PromotionalCampaign | null>(null);
  const [activeDiscounts, setActiveDiscounts] = useState<Record<string, CampaignProductDiscount>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchActivePromotions = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns/active', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!res.ok) {
        setActiveCampaign(null);
        setActiveDiscounts({});
        return;
      }
      const data = await res.json();
      setActiveCampaign(data.campaign || null);
      setActiveDiscounts(data.discounts || {});
    } catch (err) {
      console.error('Error fetching campaign promotions context:', err);
      setActiveCampaign(null);
      setActiveDiscounts({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePromotions();
  }, [fetchActivePromotions]);

  const getProductDiscount = useCallback((
    productId: string, 
    price: number, 
    individualOriginalPrice?: number
  ): ProductDiscountResult => {
    // 1. Verificar si tiene oferta individual válida
    const hasValidIndividual = Boolean(
      individualOriginalPrice && 
      Number(individualOriginalPrice) > Number(price) && 
      Number(price) > 0
    );
    const individualOrig = hasValidIndividual && individualOriginalPrice ? Number(individualOriginalPrice) : price;
    const individualPrice = Number(price);

    // 2. Verificar si tiene oferta por campaña activa
    const campDisc = activeDiscounts[productId];
    let hasValidCampaign = false;
    let campaignFinalPrice = individualOrig;

    if (campDisc && individualOrig > 0) {
      if (campDisc.discountType === 'percentage') {
        const percent = Math.min(99, Math.max(1, campDisc.discountValue));
        campaignFinalPrice = Math.round(individualOrig * (1 - percent / 100));
      } else {
        campaignFinalPrice = Math.round(campDisc.discountValue);
      }

      if (campaignFinalPrice > 0 && campaignFinalPrice < individualOrig) {
        hasValidCampaign = true;
      }
    }

    // Caso A: Ambos descuentos existen -> Regla de prioridad: Menor precio promocional (mejor oferta para el cliente)
    if (hasValidCampaign && hasValidIndividual) {
      const bestPrice = Math.min(campaignFinalPrice, individualPrice);
      const savings = Math.max(0, individualOrig - bestPrice);
      const discountPercent = Math.round((savings / individualOrig) * 100);
      return {
        hasDiscount: true,
        finalPrice: bestPrice,
        originalPrice: individualOrig,
        discountPercent,
        savings,
        discountSource: bestPrice === campaignFinalPrice ? 'campaign' : 'individual',
        campaignTitle: bestPrice === campaignFinalPrice ? activeCampaign?.title : undefined
      };
    }

    // Caso B: Solo campaña activa válida
    if (hasValidCampaign) {
      const savings = Math.max(0, individualOrig - campaignFinalPrice);
      const discountPercent = Math.round((savings / individualOrig) * 100);
      return {
        hasDiscount: true,
        finalPrice: campaignFinalPrice,
        originalPrice: individualOrig,
        discountPercent,
        savings,
        discountSource: 'campaign',
        campaignTitle: activeCampaign?.title
      };
    }

    // Caso C: Solo oferta individual válida
    if (hasValidIndividual) {
      const savings = Math.max(0, individualOrig - individualPrice);
      const discountPercent = Math.round((savings / individualOrig) * 100);
      return {
        hasDiscount: true,
        finalPrice: individualPrice,
        originalPrice: individualOrig,
        discountPercent,
        savings,
        discountSource: 'individual'
      };
    }

    // Caso D: Sin descuento vigente
    return {
      hasDiscount: false,
      finalPrice: price,
      originalPrice: price,
      discountPercent: 0,
      savings: 0
    };
  }, [activeDiscounts, activeCampaign]);

  const applyDiscountToProduct = useCallback((product: Product): Product => {
    const disc = getProductDiscount(product.id, product.price, product.originalPrice);
    if (!disc.hasDiscount) return product;

    return {
      ...product,
      price: disc.finalPrice,
      originalPrice: disc.originalPrice,
      discountPercent: disc.discountPercent,
      hasDiscount: true,
      savings: disc.savings
    };
  }, [getProductDiscount]);

  return (
    <CampaignPromotionsContext.Provider
      value={{
        activeCampaign,
        activeDiscounts,
        getProductDiscount,
        applyDiscountToProduct,
        refreshCampaigns: fetchActivePromotions,
        isLoading
      }}
    >
      {children}
    </CampaignPromotionsContext.Provider>
  );
}

export function useCampaignPromotions() {
  const context = useContext(CampaignPromotionsContext);
  return context || defaultContextValue;
}
