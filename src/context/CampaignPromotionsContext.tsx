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
  campaignTitle?: string;
}

interface CampaignPromotionsContextType {
  activeCampaign: PromotionalCampaign | null;
  activeDiscounts: Record<string, CampaignProductDiscount>;
  getProductDiscount: (productId: string, basePrice: number) => ProductDiscountResult;
  applyDiscountToProduct: (product: Product) => Product;
  refreshCampaigns: () => Promise<void>;
  isLoading: boolean;
}

const defaultContextValue: CampaignPromotionsContextType = {
  activeCampaign: null,
  activeDiscounts: {},
  getProductDiscount: (_id: string, basePrice: number) => ({
    hasDiscount: false,
    finalPrice: basePrice,
    originalPrice: basePrice,
    discountPercent: 0,
    savings: 0
  }),
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
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return;
      const data = await res.json();
      setActiveCampaign(data.campaign || null);
      setActiveDiscounts(data.discounts || {});
    } catch (err) {
      console.error('Error fetching campaign promotions context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePromotions();
  }, [fetchActivePromotions]);

  const getProductDiscount = useCallback((productId: string, basePrice: number): ProductDiscountResult => {
    const disc = activeDiscounts[productId];
    if (!disc || basePrice <= 0) {
      return {
        hasDiscount: false,
        finalPrice: basePrice,
        originalPrice: basePrice,
        discountPercent: 0,
        savings: 0
      };
    }

    let finalPrice = disc.discountPrice;

    // Recálculo dinámico seguro si el precio base en catálogo cambió
    if (disc.discountType === 'percentage') {
      const percent = Math.min(99, Math.max(1, disc.discountValue));
      finalPrice = Math.round(basePrice * (1 - percent / 100));
    } else {
      finalPrice = Math.round(disc.discountValue);
    }

    // Validación estricta
    if (finalPrice <= 0 || finalPrice >= basePrice) {
      return {
        hasDiscount: false,
        finalPrice: basePrice,
        originalPrice: basePrice,
        discountPercent: 0,
        savings: 0
      };
    }

    const savings = Math.max(0, basePrice - finalPrice);
    const discountPercent = Math.round((savings / basePrice) * 100);

    return {
      hasDiscount: true,
      finalPrice,
      originalPrice: basePrice,
      discountPercent,
      savings,
      campaignTitle: activeCampaign?.title
    };
  }, [activeDiscounts, activeCampaign]);

  const applyDiscountToProduct = useCallback((product: Product): Product => {
    const disc = getProductDiscount(product.id, product.price);
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
