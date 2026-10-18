'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search, 
  Trash2, 
  FileText, 
  MessageCircle, 
  Eye, 
  X, 
  ChevronDown, 
  Truck,
  CheckCircle2,
  Package
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from '@/utils/whatsapp';
import { toast } from 'sonner';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { Product } from '@/types';
import SafeImage from '@/components/common/SafeImage';

const STATUS_COLORS: Record<string, string> = {
  'Pendiente': 'border-amber-200 bg-amber-50 text-amber-700',
  'Confirmado': 'border-yellow-200 bg-yellow-50 text-yellow-700',
  'En preparación': 'border-blue-200 bg-blue-50 text-blue-700',
  'Enviado': 'border-indigo-200 bg-indigo-50 text-indigo-700',
  'Entregado': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Cancelado': 'border-gray-200 bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = [
  'Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'
];

const getWhatsAppMessage = (order: any) => {
  const base = `Hola ${order.name}, te contactamos de Lumira Beauty. `;
  switch (order.status) {
    case 'Pendiente':
      return `${base}Recibimos tu pedido ${order.orderNumber}. Por favor, confírmanos tus datos para comenzar a prepararlo.`;
    case 'Confirmado':
      return `${base}Tu pedido ${order.orderNumber} ha sido confirmado. ¡Pronto comenzaremos a prepararlo!`;
    case 'En preparación':
      return `${base}Tu pedido ${order.orderNumber} ya está en preparación y pronto será despachado.`;
    case 'Enviado':
      const guiaInfo = order.trackingNumber ? ` con guía ${order.trackingNumber} (${order.shippingCompany || 'Transportadora'})` : '';
      return `${base}¡Excelentes noticias! Tu pedido ${order.orderNumber} acaba de ser enviado${guiaInfo}.`;
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

  // Modal de Detalle de Pedido (Referencia Imagen 3)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingCompany, setShippingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  useEffect(() => {
    initializeData(initialOrders);
  }, []);

  const displayOrders = globalOrders.length > 0 ? globalOrders : localOrders;

  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = 
      (order.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.whatsapp || '').includes(searchTerm) || 
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Al abrir el modal de un pedido, precargar empresa y guía si existen
  useEffect(() => {
    if (selectedOrder) {
      setShippingCompany(selectedOrder.shippingCompany || '');
      setTrackingNumber(selectedOrder.trackingNumber || '');
    }
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Error al actualizar');

      const updated = localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setLocalOrders(updated);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      await triggerRefresh(false);
      toast.success(`Estado actualizado a ${newStatus}`);
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveShipping = async () => {
    if (!selectedOrder) return;
    setIsSavingShipping(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Enviado',
          shippingCompany: shippingCompany.trim(),
          trackingNumber: trackingNumber.trim()
        })
      });

      if (!res.ok) throw new Error('Error al guardar datos de envío');

      const updatedOrder = { 
        ...selectedOrder, 
        status: 'Enviado', 
        shippingCompany: shippingCompany.trim(),
        trackingNumber: trackingNumber.trim()
      };

      setSelectedOrder(updatedOrder);
      setLocalOrders(localOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      await triggerRefresh(false);
      toast.success('Pedido marcado como ENVIADO con guía de despacho');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar envío');
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setLocalOrders(localOrders.filter(o => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
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

  const parseOrderProducts = (productsString: string, total: number = 0) => {
    if (!productsString) return [];
    const lines = productsString.split('\n').filter(Boolean);
    return lines.map(line => {
      const match = line.match(/^(\d+)x\s(.+?)(?:\s\((.+)\))?$/);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2];
        const variant = match[3];
        
        const catalogProduct = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
        const unitPrice = catalogProduct?.price || Math.round(total / (lines.length || 1));
        
        return {
          quantity: qty,
          name: name,
          variant: variant || null,
          image: catalogProduct?.image || null,
          price: unitPrice,
        };
      }
      return {
        quantity: 1,
        name: line,
        variant: null,
        image: null,
        price: Math.round(total / (lines.length || 1))
      };
    });
  };

  const handleDownloadPDF = (order: any) => {
    const doc = new jsPDF();
    
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('LUMIRA BEAUTY', 14, 25);
    
    doc.setFontSize(11);
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
    doc.text(`Teléfono: ${order.whatsapp}`, 14, 72);
    doc.text(`Ciudad: ${order.city}`, 14, 79);
    doc.text(`Dirección: ${order.address} ${order.neighborhood ? `(${order.neighborhood})` : ''}`, 14, 86);
    if (order.trackingNumber) {
      doc.text(`Guía: ${order.shippingCompany || 'Transportadora'} - ${order.trackingNumber}`, 14, 93);
    }

    const items = parseOrderProducts(order.products, order.total);
    const tableData = items.map(item => [
      item.name,
      item.variant || '-',
      item.quantity.toString(),
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: order.trackingNumber ? 100 : 93,
      head: [['Producto', 'Detalle/Tono', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.rect(120, finalY + 5, 76, 18, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Total:', 125, finalY + 16);
    doc.setTextColor(236, 72, 153);
    doc.text(`${formatPrice(order.total)}`, 145, finalY + 16);

    doc.save(`Factura-${order.orderNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Título Estilo Referencia Imagen 2 */}
      <div>
        <h1 className="text-3xl font-heading font-normal text-gray-900">Pedidos</h1>
      </div>

      {/* Buscador y Filtro Superior */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por # de pedido, cliente o ciudad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
        <div className="w-full md:w-56">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-700"
          >
            <option value="Todos">Todos los estados</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Pedidos (Referencia Imagen 2) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold tracking-wider bg-gray-50/40">
                <th className="py-4 px-4 sm:px-6">Pedido #</th>
                <th className="py-4 px-4">Cliente</th>
                <th className="py-4 px-4">Fecha</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const orderDate = order.date ? new Date(order.date) : new Date();
                  const dateFormatted = !isNaN(orderDate.getTime()) 
                    ? format(orderDate, "d/M/yyyy") 
                    : '-';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Columna: Pedido # */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-gray-900 whitespace-nowrap">
                        {order.orderNumber || order.id?.slice(0, 8)}
                      </td>

                      {/* Columna: Cliente (Nombre y Ciudad debajo) */}
                      <td className="py-4 px-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{order.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{order.city || 'Colombia'}</p>
                        </div>
                      </td>

                      {/* Columna: Fecha */}
                      <td className="py-4 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Columna: Estado (Pill dropdown con borde sutil) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-semibold px-3 py-1 rounded-md border outline-none cursor-pointer transition-colors uppercase tracking-wide ${
                            STATUS_COLORS[order.status] || 'border-gray-200 bg-gray-50 text-gray-700'
                          } ${updatingId === order.id ? 'opacity-50' : ''}`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status} className="bg-white text-gray-900 normal-case">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Columna: Total */}
                      <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>

                      {/* Columna: Acciones (Ojito azul + Papelera roja) */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles del pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            disabled={updatingId === order.id}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar pedido"
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
      </div>

      {/* MODAL DETALLE DE PEDIDO (Referencia Imagen 3) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">ORDEN</p>
                <h2 className="text-3xl font-heading font-bold text-gray-900 mt-0.5">
                  #{selectedOrder.orderNumber || selectedOrder.id?.slice(0, 8)}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 2 Tarjetas: Info Cliente & Envío y Pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarjeta 1: INFORMACIÓN DEL CLIENTE */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  INFORMACIÓN DEL CLIENTE
                </p>
                <p className="font-bold text-gray-900 text-sm">{selectedOrder.name}</p>
                <p className="text-xs text-gray-500">
                  CC: {selectedOrder.document || selectedOrder.id?.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedOrder.whatsapp}
                </p>
                <p className="text-xs text-gray-500 truncate" title={selectedOrder.email}>
                  {selectedOrder.email || (selectedOrder.name.toLowerCase().replace(/\s+/g, '') + '@gmail.com')}
                </p>
              </div>

              {/* Tarjeta 2: DETALLES DE ENVÍO Y PAGO */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  DETALLES DE ENVÍO Y PAGO
                </p>
                <p className="font-semibold text-gray-900 text-sm">
                  {selectedOrder.city}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedOrder.address} {selectedOrder.neighborhood ? `(${selectedOrder.neighborhood})` : ''}
                </p>
                <div className="pt-2">
                  <span className="border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-block">
                    Pago Contra Entrega
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: LOGÍSTICA DE ENVÍO */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  LOGÍSTICA DE ENVÍO
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Si gestionas un envío nacional, ingresa la guía.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text"
                  placeholder="Servientrega / Interrapidísimo"
                  value={shippingCompany}
                  onChange={(e) => setShippingCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <input 
                  type="text"
                  placeholder="Número de guía"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button 
                onClick={handleSaveShipping}
                disabled={isSavingShipping}
                className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSavingShipping ? 'Guardando...' : 'Marcar como ENVIADO'}
              </button>
            </div>

            {/* Sección: PRODUCTOS COMPRADOS */}
            <div>
              {(() => {
                const orderItems = parseOrderProducts(selectedOrder.products, selectedOrder.total);
                return (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                      PRODUCTOS COMPRADOS ({orderItems.length})
                    </p>
                    <div className="space-y-2">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200 p-0.5">
                              <SafeImage
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="60px"
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                              {item.variant && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{item.variant}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right whitespace-nowrap flex-shrink-0">
                            <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
                            <p className="font-bold text-sm text-gray-900 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Acciones Secundarias al fondo del Modal */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleDownloadPDF(selectedOrder)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                Descargar Factura PDF
              </button>

              <a 
                href={`https://wa.me/${selectedOrder.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(selectedOrder))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
