'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { format, subDays, isSameDay, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/utils/whatsapp';

export default function DashboardClient({ initialOrders, initialProducts }: { initialOrders: any[], initialProducts: Product[] }) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const stats = useMemo(() => {
    const now = new Date();
    
    // Filter orders based on dateRange
    const filteredOrders = initialOrders.filter(order => {
      const orderDate = new Date(order.date);
      if (dateRange === 'today') {
        return isSameDay(orderDate, now);
      }
      if (dateRange === 'week') {
        return isWithinInterval(orderDate, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
      }
      if (dateRange === 'month') {
        return isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });
      }
      return true;
    });

    // Calculate metrics
    const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const orderCount = filteredOrders.length;
    
    // New customers in period
    const uniqueWhatsapps = new Set(filteredOrders.map(o => o.whatsapp).filter(Boolean));
    const newCustomersCount = uniqueWhatsapps.size;
    
    // New products (isNew flag)
    const newProductsCount = initialProducts.filter(p => p.isNew).length;

    return { totalSales, orderCount, newCustomersCount, newProductsCount };
  }, [initialOrders, initialProducts, dateRange]);

  // Chart data (Sales last 7 days)
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const ordersOnDay = initialOrders.filter(o => isSameDay(new Date(o.date), date));
      const total = ordersOnDay.reduce((sum, o) => sum + (o.total || 0), 0);
      data.push({
        date: format(date, 'EEE d', { locale: es }),
        ventas: total
      });
    }
    return data;
  }, [initialOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Resumen del Día</h1>
          <p className="text-gray-500 text-sm">Monitorea el rendimiento actual de tu tienda</p>
        </div>
        
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas totales</p>
              <h3 className="text-xl font-bold text-gray-900">{formatPrice(stats.totalSales)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.orderCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.newCustomersCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Productos Nuevos</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.newProductsCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-heading">Ventas últimos 7 días</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  tickFormatter={(value) => `$${(value/1000)}k`}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatPrice(value), 'Ventas']}
                />
                <Bar dataKey="ventas" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 font-heading">Últimos Pedidos</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {initialOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900 truncate w-32 sm:w-48">{order.name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(order.date), 'MMM d, HH:mm', { locale: es })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'Enviado' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Entregado' ? 'bg-green-100 text-green-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
