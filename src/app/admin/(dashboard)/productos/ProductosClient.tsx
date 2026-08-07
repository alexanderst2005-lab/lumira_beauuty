'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Search, Plus, Edit2, Trash2, Copy, Check, X, Image as ImageIcon } from 'lucide-react';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';

import ProductModal from './ProductModal';

export default function ProductosClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['Todas', 'Makeup', 'Skincare', 'Corporal', 'Accesorios', 'Pestañas P a P', 'Pestañas Enteras', 'Cabello', 'Labios'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterActive === 'all' ? true : (filterActive === 'active' ? product.active : !product.active);
    
    // Mapeo simple de categorías para coincidencias más flexibles
    const normalizeCat = (c: string) => c.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesCategory = activeCategory === 'Todas' ? true : normalizeCat(product.category) === normalizeCat(activeCategory);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleActive = async (product: Product) => {
    try {
      const targetId = product.notionId || product.id;
      const res = await fetch(`/api/admin/productos/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
        toast.success(`Producto ${product.active ? 'desactivado' : 'activado'}`);
      }
    } catch {
      toast.error('Error al actualizar el producto');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('¿Estás seguro de eliminar este producto? (Se archivará en Notion)')) return;
    
    try {
      const targetId = product.notionId || product.id;
      const res = await fetch(`/api/admin/productos/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== product.id));
        toast.success('Producto eliminado');
      } else {
        toast.error('No se pudo eliminar de Notion');
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    // Al duplicar le quitamos el ID para que lo tome como nuevo
    const duplicated = { ...product, id: '', notionId: undefined, name: product.name + ' (Copia)' };
    setEditingProduct(duplicated);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">Gestiona tu catálogo ({products.length} productos)</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-2.5 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
            <div className="aspect-square bg-gray-50 rounded-lg mb-2 relative overflow-hidden flex items-center justify-center">
              {product.image && product.image !== '/images/products/placeholder.webp' ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
              
              <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">Stock {product.stock}</span>
                )}
                {product.stock === 0 && (
                  <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">Agotado</span>
                )}
                {!product.active && (
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">Inactivo</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-[3.5rem]">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 truncate">{product.category}</p>
              <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-tight flex-1">{product.name}</h3>
              <p className="font-bold text-sm text-gray-900 mt-1">{formatPrice(product.price)}</p>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-end gap-1">
              <div className="flex gap-0.5">
                <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDuplicate(product)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Duplicar">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(product)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            window.location.reload(); // Reload to fetch fresh data from Notion
          }} 
        />
      )}
    </div>
  );
}
