import { ShoppingBag, MessageCircle, Truck, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: ShoppingBag,
    title: 'Compra fácil',
    description: 'Encuentra tus productos favoritos y realiza tu pedido de forma sencilla y directa.',
  },
  {
    icon: MessageCircle,
    title: 'Atención personalizada',
    description: 'Estamos disponibles para ayudarte con tus dudas sobre tonos, rutinas y pedidos.',
  },
  {
    icon: Truck,
    title: 'Envíos confiables',
    description: 'Consulta las opciones de entrega y envío disponibles para tu ubicación en Colombia.',
  },
  {
    icon: Sparkles,
    title: 'Calidad y cuidado',
    description: 'Descubre productos seleccionados con dedicación para acompañar tu rutina de belleza.',
  },
];

export default function StoreBenefits() {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-[#E5E5E5]" aria-label="Beneficios de comprar en Lumira Beauty">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white border border-[#E5E5E5] hover:border-black/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4 transition-transform duration-300 hover:scale-110">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-medium text-base sm:text-xl text-txt mb-1.5 sm:mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-txt-secondary font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
