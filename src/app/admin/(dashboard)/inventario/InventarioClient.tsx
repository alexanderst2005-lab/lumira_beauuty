'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Search, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function InventarioClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = (id: string, newStock: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const handleSaveStock = async (product: Product) => {
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/admin/productos/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: product.stock })
      });
      if (res.ok) {
        toast.success('Stock actualizado');
      } else {
        toast.error('Error al actualizar');
      }
    } catch {
      toast.error('Error de red');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Inventario Rápido</h1>
          <p className="text-gray-500 text-sm">Actualiza el stock de tus productos de forma inmediata</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Stock Disponible</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {product.image && product.image !== '/images/products/placeholder.webp' ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 line-clamp-1 max-w-[200px] sm:max-w-xs">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    {product.stock === 0 ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">Agotado</span>
                    ) : product.stock !== undefined && product.stock <= 5 ? (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Poco stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">En stock</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={product.stock ?? 10} 
                        onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-center"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleSaveStock(product)}
                      disabled={updatingId === product.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {updatingId === product.id ? 'Guardando...' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
