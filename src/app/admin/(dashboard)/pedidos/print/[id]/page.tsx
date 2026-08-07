import { getAllOrdersFromNotion } from '@/data/notion';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/utils/whatsapp';

export const revalidate = 0;

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = await getAllOrdersFromNotion();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    notFound();
  }

  // Deserializar los productos y tonos (están como un string separado por saltos de línea)
  const productLines = order.products.split('\n').filter(Boolean);
  const toneLines = order.tones.split('\n').filter(Boolean);

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 font-sans max-w-3xl mx-auto">
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">LUMIRA BEAUTY</h1>
          <p className="text-gray-500">Recibo de Pedido</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl mb-1">Orden #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-gray-500">{format(new Date(order.date), "dd 'de' MMMM, yyyy", { locale: es })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-3">Información del Cliente</h3>
          <p className="font-bold text-lg mb-1">{order.name}</p>
          <p className="text-gray-600 mb-1">{order.whatsapp}</p>
          <p className="text-gray-600 mb-1">{order.city}</p>
          <p className="text-gray-600">{order.address}</p>
          {order.neighborhood && <p className="text-gray-600">{order.neighborhood}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-3">Detalles del Estado</h3>
          <p className="font-medium text-lg mb-1">{order.status}</p>
        </div>
      </div>

      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 text-gray-500 font-bold uppercase text-sm">Productos solicitados</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {productLines.map((line: string, i: number) => (
            <tr key={i}>
              <td className="py-4 font-medium">{line}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {toneLines.length > 0 && (
        <div className="mb-12">
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-3">Tonos Seleccionados</h3>
          <ul className="list-disc list-inside text-gray-700">
            {toneLines.map((line: string, i: number) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t-2 border-gray-200 pt-8 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center text-gray-400 text-sm print:fixed print:bottom-8 print:w-full">
        Gracias por tu compra en Lumira Beauty. ¡Esperamos que lo disfrutes!
      </div>
    </div>
  );
}
