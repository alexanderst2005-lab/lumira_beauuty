'use client';

import { useState } from 'react';
import { Save, Store, Image as ImageIcon, Settings, MessageCircle, Camera, Loader2 } from 'lucide-react';

export default function ConfigClient({ initialConfig }: { initialConfig: any }) {
  const [activeTab, setActiveTab] = useState<'tienda' | 'banner'>('tienda');
  const [config, setConfig] = useState(initialConfig || {
    storeName: '',
    logo: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    address: '',
    hours: '',
    bannerTitle: '',
    bannerText: '',
    bannerPromo: '',
    bannerImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Error al guardar');
      setMessage({ text: 'Configuración guardada exitosamente.', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error al guardar la configuración.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">Personaliza tu tienda y tu banner principal</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary px-6 py-2.5 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200">
        <button
          onClick={() => setActiveTab('tienda')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'tienda' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Store className="w-4 h-4" /> Configuración de Tienda
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'banner' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ImageIcon className="w-4 h-4" /> Banner Principal
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'tienda' ? (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tienda</label>
                <input type="text" name="storeName" value={config.storeName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo</label>
                <input type="text" name="logo" value={config.logo} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="URL o ruta de la imagen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (con código de país, ej. +57...)</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input type="text" name="whatsapp" value={config.whatsapp} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (URL o usuario)</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input type="text" name="instagram" value={config.instagram} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook (URL)</label>
                <input type="text" name="facebook" value={config.facebook} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TikTok (URL)</label>
                <input type="text" name="tiktok" value={config.tiktok} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
                <input type="text" name="address" value={config.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horarios de Atención</label>
                <input type="text" name="hours" value={config.hours} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Lunes a Sábado: 8am - 6pm" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-4">Personalizar Banner Inicial</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                <input type="text" name="bannerTitle" value={config.bannerTitle} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Descriptivo</label>
                <textarea name="bannerText" value={config.bannerText} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pequeño texto superior (Promo o Badge)</label>
                <input type="text" name="bannerPromo" value={config.bannerPromo} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fondo / Color / Imagen (Puedes dejarlo en blanco para usar el por defecto)</label>
                <input type="text" name="bannerImage" value={config.bannerImage} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="URL de la imagen o código de color" />
                <p className="text-xs text-gray-500 mt-1">Sugerencia: Si usas colores por defecto, el sistema generará gradientes elegantes.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
