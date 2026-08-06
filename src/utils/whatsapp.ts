import { CartItem } from '@/types';

const WHATSAPP_NUMBER = '573011675661'; // Reemplaza con el número real

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  const productLines = items
    .map((item) => `• ${item.product.name} x${item.quantity}`)
    .join('\n');

  const message = `Hola, quiero realizar el siguiente pedido:\n\n${productLines}\n\nTotal: ${formatPrice(total)}`;

  return message;
}

export function getWhatsAppUrl(items: CartItem[], total: number): string {
  const message = generateWhatsAppMessage(items, total);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
