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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterActive === 'all' ? true : (filterActive === 'active' ? product.active : !product.active);
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/productos/${product.id}`, {
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? (Se archivará en Notion)')) return;
    
    try {
      const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast.success('Producto eliminado');
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
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

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col shadow-sm group">
            <div className="aspect-square bg-gray-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
              {product.image && product.image !== '/images/products/placeholder.webp' ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-300" />
              )}
              
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Poco stock ({product.stock})</span>
                )}
                {product.stock === 0 && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Agotado</span>
                )}
                {!product.active && (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Inactivo</span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">{product.category}</p>
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
              <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleActive(product)}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                  product.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {product.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {product.active ? 'Activo' : 'Inactivo'}
              </button>
              
              <div className="flex gap-1">
                <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Duplicar">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
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
