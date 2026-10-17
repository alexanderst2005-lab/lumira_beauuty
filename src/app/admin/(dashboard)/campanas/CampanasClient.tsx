'use client';

import React, { useState } from 'react';
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
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import { PromotionalCampaign, CampaignFrequency, CampaignStatus } from '@/types/campaign';
import PromotionalPopup from '@/components/common/PromotionalPopup';

interface CampanasClientProps {
  initialCampaigns: PromotionalCampaign[];
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

export default function CampanasClient({ initialCampaigns }: CampanasClientProps) {
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
    endDate: ''
  });

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
      buttonText: 'Explorar Catálogo',
      buttonUrl: '/#catalogo',
      frequency: 'once_per_session',
      enabled: true,
      startDate: '',
      endDate: ''
    });
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
      endDate: campaign.endDate || ''
    });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título de la campaña es obligatorio');
      return;
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

      toast.success(editingCampaign ? 'Campaña actualizada con éxito' : 'Campaña creada con éxito');
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
      toast.success('Estado de campaña actualizado');
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
      // Actualización optimista inmediata en pantalla
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
                Configura anuncios emergentes (popup) que verán los clientes al ingresar a la tienda.
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
                  {activeCampaign ? 'Popup Activo en Tienda' : 'Sin Anuncio Activo'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {activeCampaign 
                  ? `Mostrando: «${activeCampaign.title}» (${FREQUENCY_LABELS[activeCampaign.frequency]?.label})`
                  : 'Ninguna campaña activa. Los visitantes navegarán normalmente sin anuncios emergentes.'}
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
                          title="Editar campaña"
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
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-heading font-bold text-xl text-gray-900">
                {editingCampaign ? 'Editar Campaña Promocional' : 'Crear Nueva Campaña'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Título del Anuncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. ¡Especial de Belleza Lumira!"
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
                  rows={3}
                  placeholder="ej. Aprovecha envíos express y descubre los productos favoritos para lucir radiante."
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
                    placeholder="ej. Hasta 30% OFF, Envío Gratis, Edición Limitada"
                    value={formData.promoBadge}
                    onChange={e => setFormData({ ...formData, promoBadge: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  />
                  <Sparkles className="w-4 h-4 text-pink-500 absolute left-3.5 top-3" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Aparece como una insignia brillante en el popup para captar la atención de inmediato.
                </p>
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
                    <div className="relative w-full h-36 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Acción Opcional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ver Catálogo, Comprar Ahora"
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
                      placeholder="ej. /#catalogo o /producto/sk-001"
                      value={formData.buttonUrl}
                      onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs bg-white"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                <div className="sm:col-span-2 text-[11px] text-gray-500">
                  Si no deseas botón en el anuncio, deja ambos campos vacíos y el popup mostrará únicamente el botón de cierre.
                </div>
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
                  <div className="font-bold text-sm text-gray-900">Activar campaña</div>
                  <div className="text-xs text-gray-500">
                    Si está desactivada, se guardará como borrador o pausada sin mostrarse a los clientes.
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
              Esta acción no se puede deshacer. La campaña dejará de mostrarse inmediatamente a los visitantes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow-md shadow-rose-500/20 transition-all"
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
