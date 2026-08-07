'use client';

import { useMemo, useState } from 'react';
import { Search, UserCircle, MapPin, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';

export default function ClientesClient({ orders: initialOrders }: { orders: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState(initialOrders);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group orders by WhatsApp to form customers
  const customers = useMemo(() => {
    const map = new Map<string, any>();
    
    for (const order of orders) {
      if (!order.whatsapp) continue;
      
      if (map.has(order.whatsapp)) {
        const c = map.get(order.whatsapp);
        c.ordersCount += 1;
        c.totalSpent += (order.total || 0);
        if (new Date(order.date) > new Date(c.lastOrderDate)) {
          c.lastOrderDate = order.date;
          c.city = order.city || c.city;
        }
      } else {
        map.set(order.whatsapp, {
          name: order.name,
          whatsapp: order.whatsapp,
          city: order.city,
          ordersCount: 1,
          totalSpent: order.total || 0,
          lastOrderDate: order.date
        });
      }
    }
    
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm)
  );

  const handleDelete = async (whatsapp: string, customerName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al cliente ${customerName} y TODOS sus pedidos? Esta acción no se puede deshacer.`)) return;
    setDeletingId(whatsapp);
    try {
      const res = await fetch(`/api/admin/clientes/${encodeURIComponent(whatsapp)}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.whatsapp !== whatsapp));
        toast.success(`Cliente ${customerName} eliminado`);
      } else {
        toast.error('Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm">Directorio de clientes ({customers.length} únicos)</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCustomers.map(customer => (
          <div key={customer.whatsapp} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm relative group">
            <button
              onClick={() => handleDelete(customer.whatsapp, customer.name)}
              disabled={deletingId === customer.whatsapp}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar Cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{customer.name}</h3>
                <p className="text-xs text-gray-500">{customer.whatsapp}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4 flex-1">
              {customer.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="line-clamp-1">{customer.city}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Pedidos</p>
                <p className="font-semibold text-gray-900">{customer.ordersCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Total Gastado</p>
                <p className="font-bold text-gray-900">{formatPrice(customer.totalSpent)}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No se encontraron clientes
          </div>
        )}
      </div>
    </div>
  );
}
