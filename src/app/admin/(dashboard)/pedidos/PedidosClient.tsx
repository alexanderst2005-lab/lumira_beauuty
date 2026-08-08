'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Printer, Trash2, FileText, MessageCircle, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { Product } from '@/types';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/utils/image';

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

export default function PedidosClient({ initialOrders, products }: { initialOrders: any[], products: Product[] }) {
  const { orders: globalOrders, initializeData, triggerRefresh } = useAdminData();
  const [localOrders, setLocalOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    initializeData(initialOrders);
  }, []);

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

      setLocalOrders(localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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
        setLocalOrders(localOrders.filter(o => o.id !== orderId));
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
    
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('LUMIRA BEAUTY', 14, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Factura Oficial de Compra', 14, 33);
    
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

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente', 14, 55);
    
    doc.setDrawColor(236, 72, 153);
    doc.line(14, 57, 80, 57);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${order.name}`, 14, 65);
    doc.text(`WhatsApp: ${order.whatsapp}`, 14, 72);
    doc.text(`Ciudad: ${order.city}`, 14, 79);
    doc.text(`Dirección de Envío: ${order.address}`, 14, 86);
    if (order.neighborhood) doc.text(`Barrio: ${order.neighborhood}`, 14, 93);

    const productsList = order.products.split('\n').filter(Boolean).map((p: string) => {
      const match = p.match(/^(\d+)x\s(.+)$/);
      if (match) {
        let desc = match[2];
        desc = desc.replace(/ \((.+?)\)$/, '\nVariantes: $1');
        return [match[1], desc];
      }
      return ['-', p];
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

    const tonesList = order.tones ? order.tones.split('\n').filter(Boolean) : [];
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

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.rect(120, finalY, 76, 20, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Total:', 125, finalY + 13);
    doc.setTextColor(236, 72, 153);
    doc.text(`${formatPrice(order.total)}`, 145, finalY + 13);

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('“Gracias por comprar en Lumira Beauty. ¡Esperamos verte de nuevo pronto!”', 105, pageHeight - 15, { align: 'center' });

    doc.save(`Factura-${order.orderNumber}.pdf`);
  };

  const parseOrderProducts = (productsString: string) => {
    if (!productsString) return [];
    const lines = productsString.split('\n').filter(Boolean);
    return lines.map(line => {
      const match = line.match(/^(\d+)x\s(.+?)(?:\s\((.+)\))?$/);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2];
        const variant = match[3];
        
        const catalogProduct = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
        
        return {
          quantity: qty,
          name: name,
          variant: variant || null,
          image: catalogProduct?.image || null,
          price: catalogProduct?.price || 0,
        };
      }
      return {
        quantity: 1,
        name: line,
        variant: null,
        image: null,
        price: 0
      };
    });
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

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            No se encontraron pedidos
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-pink-200">
              {/* Header */}
              <div className="bg-gray-50/80 border-b border-gray-100 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-pink-600 font-bold mb-1">PEDIDO #{order.orderNumber}</div>
                  <div className="text-sm font-medium text-gray-900 flex flex-wrap items-center gap-1.5">
                    <span>{order.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{order.city}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{format(new Date(order.date), "d MMM yyyy", { locale: es })}</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className="text-sm text-gray-900 flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Total:</span>
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-pink-500 cursor-pointer outline-none appearance-none text-center min-w-[120px] ${
                      STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                    } ${updatingId === order.id ? 'opacity-50' : ''}`}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status} className="bg-white text-gray-900 text-left">
                        {status === 'Entregado' ? '🟢 ' : status === 'Enviado' ? '🟣 ' : ''}{status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products List */}
              <div className="p-4 sm:px-6 space-y-2">
                {parseOrderProducts(order.products).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-2 group">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                      {item.image && item.image !== '/images/products/placeholder.webp' ? (
                        <Image src={getOptimizedImageUrl(item.image, 100)} alt={item.name} fill className="object-cover" unoptimized />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-pink-600 transition-colors">{item.name}</p>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">x{item.quantity}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-medium text-pink-600">{formatPrice(item.price > 0 ? item.price : 0)}</span>
                        {item.variant && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600 font-medium">{item.variant}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {item.price > 0 && (
                      <div className="hidden sm:block text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50/50 border-t border-gray-100 p-3 sm:px-6 flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleDownloadPDF(order)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Factura</span>
                </button>
                <a 
                  href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <button 
                  onClick={() => handleDelete(order.id)}
                  disabled={updatingId === order.id}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 ml-auto sm:ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
