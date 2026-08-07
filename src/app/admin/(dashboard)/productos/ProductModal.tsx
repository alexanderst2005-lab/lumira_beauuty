'use client';

import { useState } from 'react';
import { Product, ProductOption, ProductOptionValue } from '@/types';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || 'makeup',
    stock: product?.stock ?? 10,
    active: product?.active ?? true,
    featured: product?.featured ?? false,
    isNew: product?.isNew ?? false,
    description: product?.description || '',
    images: product?.images?.length ? product.images : (product?.image ? [product.image] : [] as string[]),
    options: product?.options || [] as ProductOption[],
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, filename: file.name }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
          toast.success('Imagen subida con éxito');
        } else {
          toast.error('Error al subir la imagen (¿Falta GITHUB_TOKEN?)');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Error procesando imagen');
      setIsUploading(false);
    }
  };

  const handleOptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, optionIndex: number, valueIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, filename: file.name }),
        });
        
        if (res.ok) {
          const data = await res.json();
          const newOptions = [...formData.options];
          newOptions[optionIndex].values[valueIndex].image = data.url;
          setFormData({ ...formData, options: newOptions });
          toast.success('Imagen de variante subida');
        } else {
          toast.error('Error al subir la imagen');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Error procesando imagen');
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', values: [] }]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const addOptionValue = (optionIndex: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].values.push({ name: '', image: '' });
    setFormData({ ...formData, options: newOptions });
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].values.splice(valueIndex, 1);
    setFormData({ ...formData, options: newOptions });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const targetId = product ? (product.notionId || product.id) : '';
      const url = product ? `/api/admin/productos/${targetId}` : '/api/admin/productos';
      const method = product ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success(product ? 'Producto actualizado' : 'Producto creado');
        onSave();
      } else {
        toast.error('Error al guardar');
      }
    } catch {
      toast.error('Error de red');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 px-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold font-heading">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                  <select 
                    value={formData.stock > 0 ? 'disponible' : 'agotado'} 
                    onChange={e => setFormData({...formData, stock: e.target.value === 'disponible' ? 10 : 0})} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white font-medium"
                  >
                    <option value="disponible">✅ Disponible</option>
                    <option value="agotado">❌ Agotado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="makeup">Makeup</option>
                  <option value="skincare">Skincare</option>
                  <option value="corporal">Corporal</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="pestanas-punto-a-punto">Pestañas P a P</option>
                  <option value="pestanas-enteras">Pestañas Enteras</option>
                  <option value="productos-cabello">Cabello</option>
                  <option value="Labios">Labios</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded" />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Producto Activo (Visible en la tienda)</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Producto Destacado</label>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isNew" checked={formData.isNew} onChange={e => setFormData({...formData, isNew: e.target.checked})} className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded" />
                  <label htmlFor="isNew" className="text-sm font-medium text-gray-700">Producto Nuevo</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes del Producto</label>
                <div className="mt-1 flex flex-col gap-3 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 relative">
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((imgUrl, i) => (
                        <div key={i} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={imgUrl} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => {
                            const newImages = [...formData.images];
                            newImages.splice(i, 1);
                            setFormData({...formData, images: newImages});
                          }} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length < 5 && (
                    <div className="space-y-1 text-center py-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500 px-2 py-1 shadow-sm border border-gray-200">
                          <span>Subir imagen</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{isUploading ? 'Subiendo...' : 'PNG, JPG, WEBP hasta 5MB'}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-heading text-gray-900">Opciones y Variantes</h3>
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Agregar Opción
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.options.map((option, optIdx) => (
                <div key={optIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <input 
                      type="text" 
                      placeholder="Nombre de la opción (ej. Aroma, Color, Tono)" 
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[optIdx].name = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-medium"
                      required
                    />
                    <button type="button" onClick={() => removeOption(optIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                    {option.values.map((val, valIdx) => (
                      <div key={valIdx} className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="Valor (ej. Caramel Crush)" 
                          value={val.name}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[optIdx].values[valIdx].name = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          required
                        />
                        
                        <div className="relative">
                          {val.image ? (
                            <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 relative">
                              <img src={val.image} alt="val" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => {
                                const newOptions = [...formData.options];
                                newOptions[optIdx].values[valIdx].image = '';
                                setFormData({ ...formData, options: newOptions });
                              }} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-10 h-10 rounded border border-gray-200 border-dashed flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 text-gray-400">
                              <Upload className="w-4 h-4" />
                              <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleOptionImageUpload(e, optIdx, valIdx)} />
                            </label>
                          )}
                        </div>

                        <button type="button" onClick={() => removeOptionValue(optIdx, valIdx)} className="text-gray-400 hover:text-red-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOptionValue(optIdx)} className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 mt-2">
                      <Plus className="w-3 h-3" /> Agregar valor
                    </button>
                  </div>
                </div>
              ))}
              {formData.options.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay opciones configuradas. Usa el botón "Agregar Opción" para crear variantes como Aroma o Tono.</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSaving || isUploading} className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
              {isSaving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
