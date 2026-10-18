'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Clock, MapPin } from 'lucide-react';
import { categories } from '@/data/products';

export default function Footer({ config }: { config?: any }) {
  const currentYear = new Date().getFullYear();
  const activeCategories = categories.filter((c) => c.slug !== 'todos').slice(0, 6);

  return (
    <footer className="bg-white border-t border-[#E5E5E5] text-txt" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105">
              <Image
                src={config?.logo || '/images/logo-transparent.png'}
                alt={config?.storeName || 'Lumira Beauty'}
                width={150}
                height={55}
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-txt-secondary leading-relaxed max-w-sm font-sans mb-6">
              Tu tienda de belleza online. Encuentra maquillaje, skincare, pestañas y accesorios de las mejores marcas al mejor precio con envíos a toda Colombia.
            </p>
            {/* Redes Sociales fijas en Brand */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/lumira_beauuty?igsh=eHkzbWJkM3Mxbm10"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                aria-label="Instagram de Lumira Beauty"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://wa.me/573011675661"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                aria-label="WhatsApp de Lumira Beauty"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
              <a
                href="https://www.tiktok.com/@lumira_beauuty?_r=1&_t=ZS-98h8qL4VCPk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                aria-label="TikTok de Lumira Beauty"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            </div>
          </div>

          {/* Categorías (Sin menú desplegable) */}
          <div className="lg:col-span-3">
            <h3 className="font-display font-medium text-txt text-base tracking-wide mb-3 sm:mb-4">
              Categorías
            </h3>
            <ul className="space-y-2.5">
              {activeCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-block font-sans"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm text-primary font-medium hover:text-primary-dark transition-colors duration-200 inline-block font-sans pt-1"
                >
                  Ver todo el catálogo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto (Sin menú desplegable) */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-medium text-txt text-base tracking-wide mb-3 sm:mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:lumirabeauty26@gmail.com"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans break-all"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>lumirabeauty26@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/573011675661"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>+57 301 167 5661</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Información (Sin menú desplegable) */}
          <div className="lg:col-span-3">
            <h3 className="font-display font-medium text-txt text-base tracking-wide mb-3 sm:mb-4">
              Información
            </h3>
            <ul className="space-y-2.5">
              <li className="text-sm text-txt-secondary flex items-start gap-2 font-sans">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Cali, Colombia</span>
              </li>
              <li className="text-sm text-txt-secondary flex items-start gap-2 font-sans">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Lunes a Domingos</span>
              </li>
              <li className="pt-1">
                <Link
                  href="/contacto"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 font-sans block"
                >
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 font-sans block"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar con crédito a MA Digital */}
      <div className="border-t border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs text-txt-secondary font-sans tracking-wide">
            © {currentYear} {config?.storeName || 'Lumira Beauty'}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-txt-secondary font-sans tracking-wide">
            Diseñado por{' '}
            <a
              href="https://wa.me/573027642208?text=Hola%20MA%20Digital,%20me%20gustar%C3%ADa%20cotizar%20un%20proyecto%20web"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline hover:text-primary-dark transition-colors inline-block"
            >
              MA Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
