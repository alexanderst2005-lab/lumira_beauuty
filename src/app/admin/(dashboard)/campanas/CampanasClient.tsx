'use client';

import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Sparkles, 
  Link as LinkIcon, 
  Upload, 
  RefreshCw,
  Power,
  Search,
  Tag,
  DollarSign,
  Percent,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { PromotionalCampaign, CampaignFrequency, CampaignStatus, CampaignProductDiscount, DiscountType } from '@/types/campaign';
import { Product } from '@/types';
import { formatPrice } from '@/utils/whatsapp';
import PromotionalPopup from '@/components/common/PromotionalPopup';

interface CampanasClientProps {
  initialCampaigns: PromotionalCampaign[];
  availableProducts?: Product[];
}

const FREQUENCY_LABELS: Record<CampaignFrequency, { label: string; desc: string }> = {
  once_per_session: {
    label: 'Una vez por sesión',
    desc: 'Se muestra al entrar y no vuelve a aparecer durante la misma sesión de navegación.'
  },
  every_24_hours: {
    label: 'Una vez cada 24 horas',
    desc: 'Si el visitante cierra el anuncio, esperará 24 horas antes de mostrárselo de nuevo.'
  },
  always: {
    label: 'En cada visita',
    desc: 'Se muestra cada vez que el visitante entra o recarga la página.'
  }
};

const STATUS_CONFIG: Record<CampaignStatus, { label: string; badge: string; icon: any }> = {
  active: {
    label: 'Activa',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    icon: CheckCircle2
  },
  scheduled: {
    label: 'Programada',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
    icon: Calendar
  },
  paused: {
    label: 'Pausada',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    icon: Clock
  },
  ended: {
    label: 'Finalizada',
    badge: 'bg-gray-100 text-gray-700 border-gray-200 ring-1 ring-gray-400/20',
    icon: AlertCircle
  },
  draft: {
    label: 'Borrador',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
    icon: Edit3
  }
};

export default function CampanasClient({ initialCampaigns, availableProducts = [] }: CampanasClientProps) {
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>(initialCampaigns);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PromotionalCampaign | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<PromotionalCampaign | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promoBadge: '',
    imageUrl: '',
    buttonText: '',
    buttonUrl: '',
    frequency: 'once_per_session' as CampaignFrequency,
    enabled: true,
    startDate: '',
    endDate: '',
    products: [] as CampaignProductDiscount[]
  });

  // Selector de productos en el modal
  const [productSearch, setProductSearch] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  const activeCampaign = campaigns.find(c => c.status === 'active');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns');
      if (!res.ok) throw new Error('Error al recargar campañas');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al obtener campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      description: '',
      promoBadge: 'Hasta 30% OFF',
      imageUrl: '',
      buttonText: 'Explorar Ofertas',
      buttonUrl: '/catalogo?ofertas=true',
      frequency: 'once_per_session',
      enabled: true,
      startDate: '',
      endDate: '',
      products: []
    });
    setProductSearch('');
    setIsProductPickerOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign: PromotionalCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      promoBadge: campaign.promoBadge || '',
      imageUrl: campaign.imageUrl || '',
      buttonText: campaign.buttonText || '',
      buttonUrl: campaign.buttonUrl || '',
      frequency: campaign.frequency || 'once_per_session',
      enabled: campaign.enabled,
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      products: campaign.products || []
    });
    setProductSearch('');
    setIsProductPickerOpen(false);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, filename: file.name })
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormData(prev => ({ ...prev, imageUrl: data.url }));
          toast.success('Imagen subida correctamente');
        } else {
          toast.error(data.error || 'Error al subir la imagen');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingImage(false);
      toast.error('Error al procesar la imagen');
    }
  };

  // Filtrar productos disponibles para añadir a la campaña
  const filteredAvailableProducts = useMemo(() => {
    const selectedIds = new Set(formData.products.map(p => p.productId));
    let prods = availableProducts.filter(p => !selectedIds.has(p.id) && !p.inTrash);
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
    }
    return prods.slice(0, 10);
  }, [availableProducts, formData.products, productSearch]);

  const handleAddProduct = (prod: Product) => {
    // Por defecto descuento del 15%
    const defaultPercent = 15;
    const discountPrice = Math.round(prod.price * (1 - defaultPercent / 100));
    const savings = prod.price - discountPrice;

    const newDiscount: CampaignProductDiscount = {
      productId: prod.id,
      productName: prod.name,
      productImage: prod.image,
      basePrice: prod.price,
      discountType: 'percentage',
      discountValue: defaultPercent,
      discountPrice,
      discountPercent: defaultPercent,
      savings
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newDiscount],
      // Sugerir botón hacia ofertas si aún no tiene URL
      buttonUrl: prev.buttonUrl || '/catalogo?ofertas=true',
      buttonText: prev.buttonText || 'Ver Ofertas'
    }));

    setProductSearch('');
    setIsProductPickerOpen(false);
    toast.success(`Producto "${prod.name}" añadido a la campaña`);
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.productId !== productId)
    }));
  };

  const handleUpdateProductDiscount = (
    productId: string, 
    field: 'discountType' | 'discountValue' | 'discountPrice', 
    val: any
  ) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(item => {
        if (item.productId !== productId) return item;

        let discountType = item.discountType;
        let discountValue = item.discountValue;
        let discountPrice = item.discountPrice;
        let discountPercent = item.discountPercent;
        let savings = item.savings;

        if (field === 'discountType') {
          discountType = val as DiscountType;
          if (discountType === 'percentage') {
            discountValue = discountPercent || 15;
            discountPrice = Math.round(item.basePrice * (1 - discountValue / 100));
            savings = item.basePrice - discountPrice;
          } else {
            discountValue = discountPrice;
          }
        } else if (field === 'discountValue') {
          // Si el tipo es porcentaje, el usuario escribió un % (ej. 20)
          if (discountType === 'percentage') {
            if (val === '' || val === null || val === undefined) {
              discountValue = '' as any;
              discountPercent = 0;
              discountPrice = item.basePrice;
              savings = 0;
            } else {
              const cleanVal = String(val).replace(/[^0-9]/g, '');
              if (cleanVal === '') {
                discountValue = '' as any;
                discountPercent = 0;
                discountPrice = item.basePrice;
                savings = 0;
              } else {
                const num = Math.min(99, Math.max(0, parseInt(cleanVal, 10)));
                discountValue = num;
                discountPercent = num;
                discountPrice = Math.round(item.basePrice * (1 - num / 100));
                savings = item.basePrice - discountPrice;
              }
            }
          } else {
            // Precio fijo promocional
            if (val === '' || val === null || val === undefined) {
              discountValue = '' as any;
              discountPrice = item.basePrice;
              savings = 0;
              discountPercent = 0;
            } else {
              const cleanVal = String(val).replace(/[^0-9]/g, '');
              const price = cleanVal === '' ? 0 : parseInt(cleanVal, 10);
              discountValue = price;
              discountPrice = price;
              savings = Math.max(0, item.basePrice - price);
              discountPercent = item.basePrice > 0 ? Math.round((savings / item.basePrice) * 100) : 0;
            }
          }
        } else if (field === 'discountPrice') {
          // El usuario escribió directamente el precio final
          const cleanVal = String(val).replace(/[^0-9]/g, '');
          const price = cleanVal === '' ? 0 : parseInt(cleanVal, 10);
          discountPrice = price;
          if (discountType === 'fixed_price') {
            discountValue = price;
          }
          savings = Math.max(0, item.basePrice - price);
          discountPercent = item.basePrice > 0 ? Math.round((savings / item.basePrice) * 100) : 0;
        }

        return {
          ...item,
          discountType,
          discountValue,
          discountPrice,
          discountPercent,
          savings
        };
      })
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título de la campaña es obligatorio');
      return;
    }

    // Validar productos seleccionados
    for (const prod of formData.products) {
      if (prod.discountPrice <= 0) {
        toast.error(`El precio promocional para "${prod.productName}" debe ser mayor a 0`);
        return;
      }
      if (prod.discountPrice >= prod.basePrice) {
        toast.error(`El precio de oferta para "${prod.productName}" debe ser menor a su precio original`);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          data: {
            ...formData,
            id: editingCampaign ? editingCampaign.id : undefined
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar campaña');
      }

      toast.success(editingCampaign ? 'Campaña y descuentos actualizados' : 'Campaña publicada con éxito');
      setIsModalOpen(false);
      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al cambiar estado');
      }
      toast.success('Estado de campaña y descuentos actualizado');
      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setDeleteConfirmId(null);

      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Campaña eliminada correctamente');
      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
      await fetchCampaigns();
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCurrent = () => {
    if (!formData.title.trim()) {
      toast.error('Escribe al menos un título para previsualizar');
      return;
    }
    const sample: PromotionalCampaign = {
      id: 'preview-current',
      title: formData.title,
      description: formData.description,
      promoBadge: formData.promoBadge,
      imageUrl: formData.imageUrl,
      buttonText: formData.buttonText,
      buttonUrl: formData.buttonUrl,
      frequency: formData.frequency,
      enabled: true,
      status: 'active',
      products: formData.products,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPreviewCampaign(sample);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
                Campañas Promocionales
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Administra anuncios emergentes (popup) y asigna descuentos reales a productos del catálogo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium text-sm shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Banner de Estado en Vivo */}
      <div className={`p-5 rounded-2xl border transition-all ${
        activeCampaign 
          ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-white border-emerald-200/80 shadow-sm'
          : 'bg-gray-50 border-gray-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              activeCampaign ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-gray-300 text-gray-600'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Estado en Tienda Pública
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeCampaign 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeCampaign ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                  {activeCampaign ? 'Popup & Descuentos Activos' : 'Sin Campaña Activa'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activeCampaign 
                  ? `Mostrando: «${activeCampaign.title}» (${activeCampaign.products?.length || 0} productos rebajados)`
                  : 'Ninguna campaña activa. Los productos mantienen sus precios habituales sin popups.'}
              </p>
            </div>
          </div>

          {activeCampaign && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewCampaign(activeCampaign)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previsualizar</span>
              </button>
              <button
                onClick={() => handleToggle(activeCampaign.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Campañas */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span>Todas las Campañas ({campaigns.length})</span>
        </h2>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No hay campañas registradas</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Crea tu primera campaña promocional para mostrar ofertas o anuncios importantes a tus visitantes.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-pink-500 text-white font-medium text-sm hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Campaña</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const statusCfg = STATUS_CONFIG[camp.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;
              const prodCount = camp.products?.length || 0;

              return (
                <div
                  key={camp.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-md ${
                    camp.status === 'active' 
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10' 
                      : 'border-gray-100'
                  }`}
                >
                  {/* Imagen superior si tiene */}
                  <div className="relative w-full h-44 bg-gray-50 border-b border-gray-100 overflow-hidden group">
                    {camp.imageUrl ? (
                      <img
                        src={camp.imageUrl}
                        alt={camp.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-b from-gray-50 to-gray-100">
                        <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                        <span className="text-xs">Sin imagen configurada</span>
                      </div>
                    )}

                    {/* Estado badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm ${statusCfg.badge}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Badge promocional */}
                    {camp.promoBadge && (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/90 backdrop-blur-md text-white text-xs font-medium shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          {camp.promoBadge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-lg text-gray-900 leading-snug line-clamp-1">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed flex-1">
                      {camp.description || 'Sin descripción adicional.'}
                    </p>

                    {/* Info de frecuencia y botón */}
                    <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="text-gray-400">Descuentos:</span>
                        <span className={`font-semibold ${prodCount > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                          {prodCount > 0 ? `${prodCount} productos en oferta` : 'Solo anuncio (sin descuentos)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="text-gray-400">Frecuencia:</span>
                        <span className="font-medium text-gray-800">
                          {FREQUENCY_LABELS[camp.frequency]?.label || 'Por sesión'}
                        </span>
                      </div>

                      {camp.buttonText && (
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="text-gray-400">Botón:</span>
                          <span className="font-medium text-pink-600 line-clamp-1">
                            {camp.buttonText} → {camp.buttonUrl || '/'}
                          </span>
                        </div>
                      )}

                      {(camp.startDate || camp.endDate) && (
                        <div className="text-[11px] text-gray-400 bg-gray-50 p-2 rounded-xl space-y-0.5">
                          {camp.startDate && <div>Inicio: {new Date(camp.startDate).toLocaleString()}</div>}
                          {camp.endDate && <div>Fin: {new Date(camp.endDate).toLocaleString()}</div>}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewCampaign(camp)}
                          className="p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                          title="Previsualizar cómo se ve el popup"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(camp)}
                          className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar campaña y productos"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(camp.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar campaña"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Switch Activar / Pausar */}
                      <button
                        onClick={() => handleToggle(camp.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          camp.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{camp.enabled ? 'Activada' : 'Desactivada'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Campaña */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl z-10 border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-heading font-bold text-xl text-gray-900">
                {editingCampaign ? 'Editar Campaña y Descuentos' : 'Crear Nueva Campaña con Descuentos'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
              {/* Información General */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4" />
                  <span>1. Configuración del Anuncio (Popup)</span>
                </h4>

                {/* Título */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Título del Anuncio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. ¡Descuentos Exclusivos en Belleza!"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Descripción o Mensaje
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ej. Disfruta de ofertas especiales en productos seleccionados por tiempo limitado."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"
                  />
                </div>

                {/* Badge promocional */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Texto Promocional Destacado (Badge)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ej. Hasta 30% OFF, Oferta Especial, Envío Gratis"
                      value={formData.promoBadge}
                      onChange={e => setFormData({ ...formData, promoBadge: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                    <Sparkles className="w-4 h-4 text-pink-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Imagen Promocional */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Imagen Promocional (Opcional)
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 text-xs font-semibold hover:bg-pink-100 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Subiendo imagen...' : 'Subir desde el dispositivo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Quitar imagen
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      placeholder="O pega una URL directa de imagen (https://...)"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs"
                    />

                    {formData.imageUrl && (
                      <div className="relative w-full h-32 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: PRODUCTOS EN DESCUENTO */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>2. Productos Reales en Descuento</span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Selecciona qué productos del catálogo tendrán precio rebajado durante esta campaña.
                    </p>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100 self-start sm:self-auto">
                    {formData.products.length} productos seleccionados
                  </span>
                </div>

                {/* Buscador y Selector de Productos */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre para añadir a la campaña..."
                      value={productSearch}
                      onChange={e => {
                        setProductSearch(e.target.value);
                        setIsProductPickerOpen(true);
                      }}
                      onFocus={() => setIsProductPickerOpen(true)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>

                  {/* Dropdown de productos disponibles */}
                  {isProductPickerOpen && filteredAvailableProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 max-h-60 overflow-y-auto divide-y divide-gray-50">
                      {filteredAvailableProducts.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleAddProduct(prod)}
                          className="p-3 flex items-center justify-between hover:bg-pink-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-white"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{prod.name}</div>
                              <div className="text-xs text-gray-500">{formatPrice(prod.price)}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-semibold hover:bg-pink-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de productos seleccionados con configuración de descuento */}
                {formData.products.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      No hay productos seleccionados. Esta campaña funcionará únicamente como un anuncio informativo sin rebajas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.products.map(item => (
                      <div
                        key={item.productId}
                        className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Info del Producto */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <img
                            src={item.productImage || '/images/products/placeholder.webp'}
                            alt={item.productName}
                            className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0"
                          />
                          <div>
                            <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName}</div>
                            <div className="text-xs text-gray-400">
                              Precio Base: <span className="font-semibold text-gray-700">{formatPrice(item.basePrice)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Configuración de Descuento */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Tipo: Porcentaje vs Precio Fijo */}
                          <div className="inline-flex rounded-xl p-1 bg-gray-100 border border-gray-200 text-xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateProductDiscount(item.productId, 'discountType', 'percentage')}
                              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                                item.discountType === 'percentage'
                                  ? 'bg-white text-pink-600 shadow-sm'
                                  : 'text-gray-600 hover:text-black'
                              }`}
                            >
                              <Percent className="w-3 h-3" />
                              <span>%</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateProductDiscount(item.productId, 'discountType', 'fixed_price')}
                              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                                item.discountType === 'fixed_price'
                                  ? 'bg-white text-pink-600 shadow-sm'
                                  : 'text-gray-600 hover:text-black'
                              }`}
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>$ COP</span>
                            </button>
                          </div>

                          {/* Entrada de valor */}
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            {item.discountType === 'percentage' ? (
                              <div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={(item.discountValue as any) === '' || !item.discountValue ? '' : item.discountValue}
                                    onChange={e => handleUpdateProductDiscount(item.productId, 'discountValue', e.target.value)}
                                    className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                  />
                                  <span className="absolute right-3 top-2 text-xs text-gray-400 font-bold pointer-events-none">%</span>
                                </div>
                                {/* Chips de porcentajes sugeridos */}
                                <div className="flex items-center gap-1 mt-1">
                                  {[10, 15, 20, 30, 50].map(pct => (
                                    <button
                                      key={pct}
                                      type="button"
                                      onClick={() => handleUpdateProductDiscount(item.productId, 'discountValue', pct)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                        Number(item.discountValue) === pct
                                          ? 'bg-pink-600 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {pct}%
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="relative">
                                  <span className="absolute left-3 top-2 text-xs text-gray-400 font-bold pointer-events-none">$</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={(item.discountValue as any) === '' || !item.discountValue ? '' : item.discountValue}
                                    onChange={e => handleUpdateProductDiscount(item.productId, 'discountValue', e.target.value)}
                                    className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Vista previa de Precios */}
                          <div className="text-right min-w-[130px]">
                            <div className="text-sm font-bold text-rose-600">
                              {formatPrice(item.discountPrice)}
                            </div>
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Ahorro: {formatPrice(item.savings)} (-{item.discountPercent}%)
                            </div>
                          </div>

                          {/* Botón Quitar */}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="p-2 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Quitar producto de la campaña"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de Acción Opcional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ver Ofertas, Comprar Ahora"
                    value={formData.buttonText}
                    onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    URL de Destino
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ej. /catalogo?ofertas=true o /#catalogo"
                      value={formData.buttonUrl}
                      onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs bg-white"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                {formData.products.length > 0 && (
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          buttonUrl: '/catalogo?ofertas=true',
                          buttonText: prev.buttonText || 'Ver Productos en Oferta'
                        }));
                        toast.success('Ruta configurada hacia los productos rebajados');
                      }}
                      className="text-xs text-pink-600 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>⚡ Conectar botón automáticamente a las ofertas del catálogo (/catalogo?ofertas=true)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Frecuencia de Aparición */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Frecuencia de Aparición para el Visitante
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['once_per_session', 'every_24_hours', 'always'] as CampaignFrequency[]).map((freq) => {
                    const isSelected = formData.frequency === freq;
                    return (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFormData({ ...formData, frequency: freq })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50/50 ring-2 ring-pink-500/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="font-semibold text-xs text-gray-900">
                          {FREQUENCY_LABELS[freq].label}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {FREQUENCY_LABELS[freq].desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Programación por Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Fecha y Hora de Inicio (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Fecha y Hora de Fin (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs"
                  />
                </div>
              </div>

              {/* Switch de activación manual */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="font-bold text-sm text-gray-900">Activar campaña y descuentos</div>
                  <div className="text-xs text-gray-500">
                    Si está desactivada, los descuentos no se aplicarán y los productos conservarán su precio base.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              {/* Botones del Form */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePreviewCurrent}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Previsualizar</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium shadow-md shadow-pink-500/20 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (editingCampaign ? 'Guardar Cambios' : 'Publicar Campaña')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900">
              ¿Eliminar esta campaña?
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer. Los descuentos asociados dejarán de aplicarse y los productos recuperarán su precio normal.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Previsualizador en Vivo del Popup */}
      {previewCampaign && (
        <PromotionalPopup
          forcedCampaign={previewCampaign}
          isPreview={true}
          onClosePreview={() => setPreviewCampaign(null)}
        />
      )}
    </div>
  );
}
