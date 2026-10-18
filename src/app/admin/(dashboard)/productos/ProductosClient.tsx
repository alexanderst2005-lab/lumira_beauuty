'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  PackageX 
} from 'lucide-react';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';
import SafeImage from '@/components/common/SafeImage';
import ProductModal from './ProductModal';

const ITEMS_PER_PAGE = 25;

export default function ProductosClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const categoryMap: Record<string, string> = {
    'Todas': 'all',
    'Makeup': 'makeup',
    'Skincare': 'skincare',
    'Corporal': 'corporal',
    'Accesorios': 'accesorios',
    'Pestañas Punto a Punto': 'pestanas-punto-a-punto',
    'Pestañas Enteras': 'pestanas-enteras',
    'Productos para el Cabello': 'productos-cabello'
  };

  const categories = Object.keys(categoryMap);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterActive === 'all' ? true : (filterActive === 'active' ? product.active : !product.active);
      
      const targetSlug = categoryMap[activeCategory];
      const matchesCategory = activeCategory === 'Todas' ? true : product.category === targetSlug;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, filterActive, activeCategory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterActive, activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleToggleActive = async (product: Product) => {
    try {
      const targetId = product.notionId || product.id;
      const newActive = !product.active;
      const res = await fetch(`/api/admin/productos/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, active: newActive } : p));
        toast.success(`Producto ${newActive ? 'activado' : 'desactivado'}`);
      } else {
        toast.error('No se pudo actualizar el estado');
      }
    } catch {
      toast.error('Error al actualizar el producto');
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      const targetId = product.notionId || product.id;
      const newStock = product.stock === 0 ? 10 : 0;
      const res = await fetch(`/api/admin/productos/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
        toast.success(`Stock actualizado: ${newStock === 0 ? 'Agotado' : 'Disponible'}`);
      } else {
        toast.error('No se pudo actualizar el stock');
      }
    } catch {
      toast.error('Error de conexión al actualizar el stock');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar "${product.name}"? (Se archivará en Notion)`)) return;
    
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
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">Gestiona tu catálogo ({products.length} productos registrados)</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        {/* Categorías en chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-black text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Estructurada de Productos (Referencia Imagen 1) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs font-semibold tracking-wider">
                <th className="py-4 px-4 sm:px-6">Producto</th>
                <th className="py-4 px-4">Precio</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <PackageX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No se encontraron productos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(product => {
                  const isAvailable = product.stock === undefined || product.stock > 0;
                  const categoryLabel = categories.find(c => categoryMap[c] === product.category) || product.category || 'General';

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Columna: Producto (Imagen + Nombre + Categoría) */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100 p-0.5 shadow-xs">
                            <SafeImage
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <h4 
                              onClick={() => handleEdit(product)}
                              className="font-bold text-gray-900 text-sm truncate hover:text-pink-600 transition-colors cursor-pointer"
                              title={product.name}
                            >
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-400 font-normal truncate mt-0.5">
                              <span className="font-medium text-gray-500">LUMIRA</span>
                              <span className="mx-1">|</span>
                              <span className="capitalize">{categoryLabel}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Columna: Precio */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Columna: Stock (Badge estilo Disponible v) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                          }`}
                          title="Haz clic para alternar stock"
                        >
                          <span>{isAvailable ? 'DISPONIBLE' : 'AGOTADO'}</span>
                          <ChevronDown className="w-3 h-3 text-current opacity-70" />
                        </button>
                      </td>

                      {/* Columna: Estado (Badge estilo ✓ Activo) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                            product.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={product.active ? 'Clic para desactivar' : 'Clic para activar'}
                        >
                          {product.active ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Columna: Acciones (Editar azul + Eliminar rojo) */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(product)} 
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDuplicate(product)} 
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title="Duplicar producto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product)} 
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación de la Tabla */}
        {totalPages > 1 && (
          <div className="py-3 px-4 sm:px-6 border-t border-gray-100 flex items-center justify-between bg-white text-xs text-gray-500">
            <div>
              Mostrando <span className="font-semibold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> de{' '}
              <span className="font-semibold text-gray-800">{filteredProducts.length}</span> productos
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-gray-700">
                Pág. {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(savedProduct, isNew) => {
            setIsModalOpen(false);
            if (savedProduct) {
              if (isNew) {
                setProducts([savedProduct, ...products]);
              } else {
                setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
              }
            }
            router.refresh();
          }} 
        />
      )}
    </div>
  );
}
