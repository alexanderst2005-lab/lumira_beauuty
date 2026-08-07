'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Printer, Trash2, FileText, MessageCircle } from 'lucide-react';
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

const getWhatsAppMessage = (order: any) => {
  const base = `Hola ${order.name}, te contactamos de Lumira Beauty. `;
  switch (order.status) {
    case 'Pendiente':
      return `${base}Recibimos tu pedido ${order.orderNumber}. Por favor, confírmanos el pago para comenzar a prepararlo.`;
    case 'Confirmado':
      return `${base}Tu pago del pedido ${order.orderNumber} ha sido confirmado. ¡Pronto comenzaremos a prepararlo!`;
    case 'En preparación':
      return `${base}Tu pedido ${order.orderNumber} ya está en preparación y pronto será despachado.`;
    case 'Enviado':
      return `${base}¡Excelentes noticias! Tu pedido ${order.orderNumber} acaba de ser enviado.`;
    case 'Entregado':
      return `${base}Vemos que tu pedido ${order.orderNumber} ha sido entregado. ¡Esperamos que lo disfrutes mucho!`;
    case 'Cancelado':
      return `${base}Lamentamos informarte que tu pedido ${order.orderNumber} ha sido cancelado. Si tienes dudas, contáctanos.`;
    default:
      return `${base}Recibimos tu pedido ${order.orderNumber}.`;
  }
};

import { useAdminData } from '@/components/admin/AdminDataContext';

export default function PedidosClient({ initialOrders }: { initialOrders: any[] }) {
  const { orders: globalOrders, initializeData, triggerRefresh } = useAdminData();
  const [localOrders, setLocalOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    initializeData(initialOrders);
  }, []);

  // Use global orders if available (real-time), fallback to local orders (initial load)
  const displayOrders = globalOrders.length > 0 ? globalOrders : localOrders;

  const filteredOrders = displayOrders.filter(order => {
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
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      // Optimistic update for local fallback
      setLocalOrders(localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Trigger global refresh to sync Context
      await triggerRefresh(false);

      toast.success(`Estado actualizado a ${newStatus}`);
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
        // Optimistic update for local fallback
        setLocalOrders(localOrders.filter(o => o.id !== orderId));
        // Trigger global refresh to sync Context
        await triggerRefresh(false);
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
    
    // Header Background
    doc.setFillColor(236, 72, 153); // Pink-500
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo / Brand Name
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('LUMIRA BEAUTY', 14, 25);
    
    // Invoice Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Factura Oficial de Compra', 14, 33);
    
    // Order Info Panel (Right side)
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Orden:`, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${order.orderNumber}`, 150, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha:`, 130, 27);
    doc.text(`${format(new Date(order.date), "dd/MM/yyyy")}`, 150, 27);
    
    doc.text(`Estado:`, 130, 34);
    doc.text(`${order.status}`, 150, 34);

    // Customer Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente', 14, 55);
    
    doc.setDrawColor(236, 72, 153);
    doc.line(14, 57, 80, 57); // Underline

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${order.name}`, 14, 65);
    doc.text(`WhatsApp: ${order.whatsapp}`, 14, 72);
    doc.text(`Ciudad: ${order.city}`, 14, 79);
    doc.text(`Dirección de Envío: ${order.address}`, 14, 86);
    if (order.neighborhood) doc.text(`Barrio: ${order.neighborhood}`, 14, 93);

    // Products table
    const productsList = order.products.split('\n').filter(Boolean).map((p: string) => {
      // Intenta separar cantidad de nombre si empieza por "Nx "
      const match = p.match(/^(\d+)x\s(.+)$/);
      if (match) return [match[1], match[2]];
      return ['1', p];
    });
    
    let currentY = 105;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Cant.', 'Descripción del Producto']],
      body: productsList,
      theme: 'grid',
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
      columnStyles: { 
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 'auto' }
      }
    });

    // Tones
    const tonesList = order.tones.split('\n').filter(Boolean);
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    if (tonesList.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Tonos / Variantes Seleccionadas:', 14, finalY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      tonesList.forEach((t: string, i: number) => {
        doc.text(`• ${t}`, 14, finalY + 7 + (i * 6));
      });
      finalY += 7 + (tonesList.length * 6) + 5;
    }

    // Total Box
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.rect(120, finalY, 76, 20, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.text('Total:', 125, finalY + 13);
    doc.setTextColor(236, 72, 153); // Pink-500
    doc.text(`${formatPrice(order.total)}`, 145, finalY + 13);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('“Gracias por comprar en Lumira Beauty. ¡Esperamos verte de nuevo pronto!”', 105, pageHeight - 15, { align: 'center' });

    doc.save(`Factura-${order.orderNumber}.pdf`);
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
                      <div className="text-xs font-mono text-pink-600 font-bold mb-1">{order.orderNumber}</div>
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
                      <a 
                        href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors inline-block"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
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
