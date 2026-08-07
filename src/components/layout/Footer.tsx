import Link from 'next/link';
import Image from 'next/image';
import { Camera, MessageCircle, Mail, Clock, ExternalLink } from 'lucide-react';
import { categories } from '@/data/products';

export default function Footer({ config }: { config?: any }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gradient-to-b from-secondary-100/50 to-secondary-100 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              {config?.logo ? (
                <Image
                  src={config.logo}
                  alt={config.storeName || "Lumira Beauty"}
                  width={140}
                  height={56}
                  className="h-12 w-auto"
                />
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={config?.storeName || "Lumira Beauty"}
                  width={140}
                  height={56}
                  className="h-12 w-auto"
                />
              )}
            </Link>
            <p className="text-sm text-txt-secondary leading-relaxed max-w-xs font-sans">
              Tu tienda de belleza online. Encuentra maquillaje, skincare, pestañas y accesorios de las mejores marcas al mejor precio.
            </p>
          </div>

          {/* Quick Links / Categories */}
          <div>
            <h3 className="font-heading font-semibold text-txt mb-4 text-sm uppercase tracking-wider">
              Categorías
            </h3>
            <ul className="space-y-3">
              {categories.filter(cat => cat.slug !== 'todos').slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 font-sans"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm text-primary font-medium hover:text-primary-dark transition-colors duration-200 inline-flex items-center gap-1 font-sans mt-1"
                >
                  Ver todo el catálogo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-txt mb-4 text-sm uppercase tracking-wider">
              Síguenos
            </h3>
            <div className="flex items-center gap-4">
              {config?.instagram && (
                <a
                  href={config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {config?.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
              )}
              {config?.facebook && (
                <a
                  href={config.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.19-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {config?.tiktok && (
                <a
                  href={config.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300"
                  aria-label="TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
              )}
            </div>

            <div className="mt-6">
              <a
                href="mailto:contacto@lumirabeauty.com"
                className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
              >
                <Mail className="w-4 h-4" />
                contacto@lumirabeauty.com
              </a>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-heading font-semibold text-txt mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-txt-secondary inline-flex items-start gap-2 font-sans">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {config?.address ? <>{config.address}<br /></> : null}
                  {config?.hours || 'Lun - Sáb: 8:00 AM - 6:00 PM'}
                </span>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 font-sans"
                >
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 font-sans"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-txt-secondary font-sans">
            © {currentYear} {config?.storeName || 'Lumira Beauty'}. Todos los derechos reservados. Hecho con 💖
          </p>
        </div>
      </div>
    </footer>
  );
}
