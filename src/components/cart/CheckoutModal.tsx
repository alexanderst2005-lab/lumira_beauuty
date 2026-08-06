'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, total } = useCart();
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    ciudad: '',
    direccion: '',
    barrio: '',
    referencia: '',
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar requeridos básicos en caso de que HTML5 falle por alguna razón
    if (!formData.nombre || !formData.whatsapp || !formData.ciudad || !formData.direccion) {
      return;
    }

    const STORE_NUMBER = '573011675661'; // Este número se configurará posteriormente
    
    let text = `Hola, quiero realizar el siguiente pedido:\n\n`;
    text += `*Productos:*\n`;
    items.forEach((item) => {
      text += `- ${item.product.name} × ${item.quantity} — ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    
    text += `\n*Total del pedido:* ${formatPrice(total)}\n\n`;
    
    text += `*Datos del cliente*\n`;
    text += `Nombre: ${formData.nombre}\n`;
    text += `WhatsApp: ${formData.whatsapp}\n`;
    text += `Ciudad: ${formData.ciudad}\n`;
    text += `Dirección: ${formData.direccion}\n`;
    if (formData.barrio) text += `Barrio: ${formData.barrio}\n`;
    if (formData.referencia) text += `Referencia: ${formData.referencia}\n`;
    if (formData.observaciones) text += `Observaciones: ${formData.observaciones}\n`;
    
    text += `\nGracias.`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${STORE_NUMBER}?text=${encodedText}`;
    
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-secondary-100/30">
              <h2 className="text-xl font-heading font-bold text-txt">Finalizar Pedido</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white transition-colors text-txt-secondary hover:text-txt"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6 cart-scrollbar">
              <p className="text-sm text-txt-secondary mb-6 font-sans">
                Completa tus datos para enviar el pedido por WhatsApp. 
                Los campos con asterisco (<span className="text-primary">*</span>) son obligatorios.
              </p>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Nombre completo <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. María Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Número de WhatsApp <span className="text-primary">*</span></label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. 3001234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Ciudad <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    name="ciudad"
                    required
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. Bogotá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Dirección de envío <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    name="direccion"
                    required
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. Calle 123 # 45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Barrio <span className="text-txt-secondary font-normal text-xs">(opcional)</span></label>
                  <input
                    type="text"
                    name="barrio"
                    value={formData.barrio}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. Chapinero"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Referencia de la dirección <span className="text-txt-secondary font-normal text-xs">(opcional)</span></label>
                  <input
                    type="text"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans"
                    placeholder="Ej. Casa verde de dos pisos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-txt mb-1">Observaciones del pedido <span className="text-txt-secondary font-normal text-xs">(opcional)</span></label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-sans resize-none"
                    placeholder="Instrucciones especiales para tu pedido..."
                  />
                </div>
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t border-border bg-secondary-100/30">
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 text-base font-sans"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar Pedido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
