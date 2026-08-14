'use client';

import { useState } from 'react';
import { RefreshCcw, Trash2, Package, ShoppingBag, Loader2 } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';

type ItemType = 'producto' | 'pedido';

export default function PapeleraClient({ initialProducts, initialOrders }: { initialProducts: any[], initialOrders: any[] }) {
  const [activeTab, setActiveTab] = useState<ItemType>('producto');
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRestore = async (item: any, type: ItemType) => {
    const uiId = item.id;
    const targetId = type === 'producto' ? (item.notionId || item.id) : item.id;
    
    setLoadingId(uiId);
    try {
      const endpoint = type === 'producto' ? `/api/admin/productos/${targetId}` : `/api/admin/pedidos/${targetId}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inTrash: false })
      });
      if (res.ok) {
        if (type === 'producto') setProducts(products.filter(p => p.id !== uiId));
        else setOrders(orders.filter(o => o.id !== uiId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermanentDelete = async (item: any, type: ItemType) => {
    if (!confirm('¿Estás seguro de eliminar este elemento para siempre? Esta acción no se puede deshacer.')) return;
    
    const uiId = item.id;
    const targetId = type === 'producto' ? (item.notionId || item.id) : item.id;

    setLoadingId(uiId);
    try {
      const endpoint = type === 'producto' ? `/api/admin/productos/${targetId}?permanent=true` : `/api/admin/pedidos/${targetId}?permanent=true`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'producto') setProducts(products.filter(p => p.id !== uiId));
        else setOrders(orders.filter(o => o.id !== uiId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Papelera de Reciclaje</h1>
        <p className="text-gray-500 text-sm">Restaura elementos eliminados o bórralos permanentemente.</p>
      </div>

      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 max-w-sm">
        <button
          onClick={() => setActiveTab('producto')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'producto' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Package className="w-4 h-4" /> Productos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('pedido')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'pedido' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Pedidos ({orders.length})
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'producto' && (
          <div className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay productos en la papelera</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                      <SafeImage src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">${product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRestore(product, 'producto')} disabled={loadingId === product.id} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restaurar">
                      {loadingId === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                    </button>
                    <button onClick={() => handlePermanentDelete(product, 'producto')} disabled={loadingId === product.id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar para siempre">
                      {loadingId === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pedido' && (
          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay pedidos en la papelera</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">{order.orderNumber} - {order.customerName}</h4>
                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()} • ${order.total.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRestore(order, 'pedido')} disabled={loadingId === order.id} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restaurar">
                      {loadingId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                    </button>
                    <button onClick={() => handlePermanentDelete(order, 'pedido')} disabled={loadingId === order.id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar para siempre">
                      {loadingId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
