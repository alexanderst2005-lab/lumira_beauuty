'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, isSameDay, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Banknote, ShoppingCart, Target } from 'lucide-react';
import { formatPrice } from '@/utils/whatsapp';

export default function VentasClient({ initialOrders }: { initialOrders: any[] }) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filtrar pedidos pagados/validados para finanzas reales (o todos por ahora si no hay un estado 'Pagado')
  // Actualmente en Lumira los estados son Pendiente, Enviado, Entregado, Cancelado.
  // Asumiremos como ventas reales los que NO están Cancelados.
  const validOrders = initialOrders.filter(o => o.status !== 'Cancelado');

  const stats = useMemo(() => {
    const now = new Date();
    
    const filteredOrders = validOrders.filter(order => {
      const orderDate = new Date(order.date);
      if (dateRange === 'today') return isSameDay(orderDate, now);
      if (dateRange === 'week') return isWithinInterval(orderDate, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
      if (dateRange === 'month') return isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });
      return true;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrdersCount = filteredOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    
    // Calcular productos vendidos analizando el string de 'products' (heurística simple)
    // El string suele tener el formato "2x Producto A (Tono: Rojo)\n1x Producto B"
    let totalItemsSold = 0;
    filteredOrders.forEach(order => {
      if (order.products) {
        const lines = order.products.split('\n');
        lines.forEach((line: string) => {
          const match = line.match(/^(\d+)x/);
          if (match && match[1]) {
            totalItemsSold += parseInt(match[1]);
          }
        });
      }
    });

    return { totalRevenue, totalOrdersCount, averageOrderValue, totalItemsSold, filteredOrders };
  }, [validOrders, dateRange]);

  // Chart data (Sales based on range)
  const chartData = useMemo(() => {
    const data = [];
    const daysToShow = dateRange === 'today' ? 7 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const ordersOnDay = validOrders.filter(o => isSameDay(new Date(o.date), date));
      const total = ordersOnDay.reduce((sum, o) => sum + (o.total || 0), 0);
      data.push({
        date: format(date, 'MMM d', { locale: es }),
        ingresos: total
      });
    }
    return data;
  }, [validOrders, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Analítica de Ventas</h1>
          <p className="text-gray-500 text-sm">Desglose financiero e ingresos de la tienda</p>
        </div>
        
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el historial</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <h3 className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
              <h3 className="text-xl font-bold text-gray-900">{formatPrice(stats.averageOrderValue)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos Exitosos</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalOrdersCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Artículos Vendidos</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalItemsSold} u.</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 font-heading">Evolución de Ingresos</h3>
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
                  formatter={(value: any) => [formatPrice(value), 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 font-heading">Últimos Ingresos</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stats.filteredOrders.slice(0, 10).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-green-100">
                <div>
                  <p className="font-medium text-sm text-gray-900 truncate w-32 sm:w-48">{order.orderNumber || 'Pedido'}</p>
                  <p className="text-xs text-gray-500">{order.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-green-600">+{formatPrice(order.total)}</p>
                  <p className="text-[10px] text-gray-400">{format(new Date(order.date), 'MMM d, HH:mm', { locale: es })}</p>
                </div>
              </div>
            ))}
            {stats.filteredOrders.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No hay ingresos en este periodo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
