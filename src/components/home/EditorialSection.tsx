import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function EditorialSection() {
  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Image Column */}
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden bg-secondary-100">
              <Image
                src="/images/editorial/editorial-beauty.jpg"
                alt="El arte de cuidarte - Lumira Beauty"
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs tracking-[0.22em] font-sans font-semibold uppercase mb-4 self-start">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>El arte de cuidarte</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-txt tracking-tight leading-[1.15] mb-5">
                Tu belleza, <span className="italic text-gradient">tu esencia.</span>
              </h2>

              <p className="text-txt-secondary text-base sm:text-lg leading-relaxed font-sans mb-8 max-w-xl">
                Descubre una selección de productos pensados para acompañar tu rutina de belleza y cuidado personal. Encuentra tus favoritos y disfruta cada detalle de tu ritual.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-sans font-medium text-sm sm:text-base tracking-wide hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group"
                  id="editorial-discover-btn"
                >
                  <span>Descubrir productos</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <span className="text-xs text-txt-muted font-sans text-center sm:text-left">
                  Envíos y asesoría personalizada directa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
