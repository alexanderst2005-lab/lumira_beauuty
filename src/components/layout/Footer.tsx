import Link from 'next/link';
import Image from 'next/image';
import { Camera, MessageCircle, Mail, Clock, ExternalLink } from 'lucide-react';
import { categories } from '@/data/products';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-secondary-100/50 to-secondary-100 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.png"
                alt="Lumira Beauty"
                width={140}
                height={56}
                className="h-12 w-auto"
              />
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
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/573011675661"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lumira_beauuty?igsh=eHkzbWJkM3Mxbm10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
                >
                  <Camera className="w-4 h-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@lumira_beauuty?_t=ZS-90RZGJ7JNiM&fbclid=PAZnRzaATg1uZwZG9mAmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp_CTKJ_LLj_YlwQOCGerLO366uygjs4G-a5Hw7SlaqyFf16VMfoDBdknL-RY_aem_rQdUGoevQFKF6pJFBzfAlQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
                >
                  <ExternalLink className="w-4 h-4" />
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@lumirabeauty.com"
                  className="text-sm text-txt-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 font-sans"
                >
                  <Mail className="w-4 h-4" />
                  contacto@lumirabeauty.com
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-heading font-semibold text-txt mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-txt-secondary inline-flex items-center gap-2 font-sans">
                <Clock className="w-4 h-4 flex-shrink-0" />
                Lun - Sáb: 8:00 AM - 6:00 PM
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
            © {new Date().getFullYear()} Lumira Beauty. Todos los derechos reservados. Hecho con 💖
          </p>
        </div>
      </div>
    </footer>
  );
}
