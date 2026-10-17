'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo puedo realizar un pedido?',
    answer:
      'El proceso es muy sencillo: explora nuestro catálogo, agrega tus productos favoritos al carrito y haz clic en «Finalizar pedido por WhatsApp». Se enviará un mensaje organizado con tu selección completa para que una asesora confirme tu pedido de inmediato.',
  },
  {
    id: 'faq-2',
    question: '¿Qué métodos de pago están disponibles?',
    answer:
      'Aceptamos transferencias directas a través de Bancolombia, Nequi y Daviplata. Además, para la ciudad de Cali contamos con servicio de pago contra entrega en zonas de cobertura.',
  },
  {
    id: 'faq-3',
    question: '¿Realizan envíos a mi ciudad?',
    answer:
      'Sí, coordinamos envíos a nivel nacional a través de empresas de mensajería certificadas. Al momento de confirmar tus datos por WhatsApp, te indicaremos el valor exacto del flete y la transportadora disponible para tu municipio.',
  },
  {
    id: 'faq-4',
    question: '¿Cuánto tarda en llegar mi pedido?',
    answer:
      'En Cali, las entregas se coordinan el mismo día o al día siguiente hábil. Para el resto de Colombia, el tiempo estimado habitual es de 2 a 5 días hábiles, sujeto a los tiempos de ruta de la transportadora.',
  },
  {
    id: 'faq-5',
    question: '¿Cómo puedo consultar el estado de mi envío?',
    answer:
      'Una vez preparado y despachado tu paquete, te enviamos el comprobante con el número de guía oficial de la transportadora para que puedas rastrear su trayecto en tiempo real.',
  },
  {
    id: 'faq-6',
    question: '¿Cómo puedo comunicarme con atención al cliente?',
    answer:
      'Puedes escribirnos directamente a nuestro canal de WhatsApp oficial mediante el botón flotante en la tienda o a través de nuestra cuenta de Instagram @lumira_beauuty. Estaremos felices de resolver cualquier duda sobre tonos, aplicaciones y pedidos.',
  },
  {
    id: 'faq-7',
    question: '¿Cómo puedo saber si un producto está disponible?',
    answer:
      'Nuestro catálogo muestra la disponibilidad en tiempo real. Si un producto o tono específico se encuentra agotado, no estará habilitado para compra. Siempre puedes consultarnos por WhatsApp ante cualquier reposición próxima.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 sm:py-24 bg-white" id="preguntas-frecuentes" aria-labelledby="faq-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs tracking-[0.22em] font-sans font-semibold uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resolvemos tus dudas</span>
          </div>
          <h2
            id="faq-title"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-txt mb-4 tracking-tight"
          >
            Preguntas <span className="text-gradient italic">frecuentes</span>
          </h2>
          <p className="text-txt-secondary text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
            Conoce los detalles sobre nuestro proceso de compra, medios de pago y envíos en Lumira Beauty.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'bg-white border-[#111111] shadow-sm'
                    : 'bg-white border-[#E5E5E5] hover:border-[#CCCCCC]'
                }`}
              >
                <button
                  type="button"
                  id={`btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${faq.id}`}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between text-left p-4 sm:p-6 gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                >
                  <span className="font-display font-medium text-base sm:text-lg text-txt tracking-tight leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-[#111111] text-white rotate-180'
                        : 'bg-[#F4F4F5] text-txt-secondary'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2]" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`panel-${faq.id}`}
                    role="region"
                    aria-labelledby={`btn-${faq.id}`}
                    className="px-4 pb-5 sm:px-6 sm:pb-6 text-txt-secondary font-sans text-sm sm:text-base leading-relaxed border-t border-[#F0E6DE]/60 pt-3.5"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact fallback */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white border border-[#E5E5E5]">
          <p className="text-sm font-sans text-txt-secondary mb-3">
            ¿Tienes alguna otra duda o consulta especial sobre un producto?
          </p>
          <a
            href="https://wa.me/573174503716?text=Hola%20Lumira%20Beauty,%20tengo%20una%20pregunta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-sans font-medium hover:bg-primary-hover shadow-sm transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hablar con una asesora por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
