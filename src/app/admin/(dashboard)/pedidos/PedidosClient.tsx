'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Printer, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  'Pendiente': 'bg-red-100 text-red-700',
  'Confirmado': 'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100 text-blue-700',
  'Enviado': 'bg-purple-100 text-purple-700',
  'Entregado': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = [
  'Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'
];

export default function PedidosClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.whatsapp.includes(searchTerm) || 
      order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success('Estado actualizado');
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        toast.success('Pedido eliminado');
      } else {
        toast.error('Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadPDF = (order: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('LUMIRA BEAUTY', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Factura de Compra', 14, 28);
    
    // Order Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Orden #: ${order.id.slice(0, 8).toUpperCase()}`, 130, 20);
    doc.text(`Fecha: ${format(new Date(order.date), "dd/MM/yyyy")}`, 130, 26);
    doc.text(`Estado: ${order.status}`, 130, 32);

    // Customer Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente', 14, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${order.name}`, 14, 52);
    doc.text(`Teléfono: ${order.whatsapp}`, 14, 58);
    doc.text(`Ciudad: ${order.city}`, 14, 64);
    doc.text(`Dirección: ${order.address}`, 14, 70);
    if (order.neighborhood) doc.text(`Barrio: ${order.neighborhood}`, 14, 76);

    // Products table
    const productsList = order.products.split('\\n').filter(Boolean).map((p: string) => [p]);
    
    autoTable(doc, {
      startY: 85,
      head: [['Productos Solicitados']],
      body: productsList,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
    });

    // Tones
    const tonesList = order.tones.split('\\n').filter(Boolean);
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    if (tonesList.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Tonos Seleccionados:', 14, finalY);
      doc.setFont('helvetica', 'normal');
      tonesList.forEach((t: string, i: number) => {
        doc.text(`- ${t}`, 14, finalY + 6 + (i * 6));
      });
      finalY += 6 + (tonesList.length * 6);
    }

    // Total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Pagado: ${formatPrice(order.total)}`, 130, finalY + 15);

    doc.save(`Factura-ORD-${order.id.slice(0,8).toUpperCase()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm">Gestiona y actualiza los pedidos de tus clientes</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="Todos">Todos los estados</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ID / Fecha</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-xs font-mono text-gray-500 mb-1">{order.id.slice(0, 8)}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(order.date), "d MMM yyyy", { locale: es })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-sm text-gray-500">{order.whatsapp}</div>
                      <div className="text-xs text-gray-400 mt-1">{order.city}</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-pink-500 cursor-pointer outline-none ${
                          STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                        } ${updatingId === order.id ? 'opacity-50' : ''}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status} className="bg-white text-gray-900">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleDownloadPDF(order)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Descargar Factura PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.open(`/admin/pedidos/print/${order.id}`, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:inline-block"
                        title="Imprimir Pedido"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        disabled={updatingId === order.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar Pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
