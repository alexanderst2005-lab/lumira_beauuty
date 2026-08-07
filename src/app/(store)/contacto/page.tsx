'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Camera, Mail, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-text mb-4">
          <span className="text-gradient">Contáctanos</span>
        </h1>
        <p className="text-text-light text-base sm:text-lg max-w-md mx-auto">
          Estamos aquí para ayudarte. ¡Escríbenos y te responderemos lo más pronto posible!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <motion.a
          href="https://wa.me/573011675661"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text mb-1">WhatsApp</h3>
          <p className="text-text-light font-sans">+57 301 1675661</p>
        </motion.a>

        {/* Instagram */}
        <motion.a 
          href="https://www.instagram.com/lumira_beauuty?igsh=eHkzbWJkM3Mxbm10" 
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200/50 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text mb-1">Instagram</h3>
          <p className="text-sm text-text-light font-sans">@lumira_beauuty</p>
        </motion.a>

        {/* TikTok */}
        <motion.a 
          href="https://www.tiktok.com/@lumira_beauuty?_t=ZS-90RZGJ7JNiM&fbclid=PAZnRzaATg1uZwZG9mAmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp_CTKJ_LLj_YlwQOCGerLO366uygjs4G-a5Hw7SlaqyFf16VMfoDBdknL-RY_aem_rQdUGoevQFKF6pJFBzfAlQ" 
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:shadow-xl hover:shadow-gray-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ExternalLink className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text mb-1">TikTok</h3>
          <p className="text-sm text-text-light font-sans">@lumira_beauuty</p>
        </motion.a>

        {/* Email */}
        <motion.a
          href="mailto:contacto@lumirabeauty.com"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text mb-1">Correo</h3>
          <p className="text-sm text-text-light">contacto@lumirabeauty.com</p>
        </motion.a>
      </div>

      {/* Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 rounded-2xl bg-secondary-100/30 border border-border text-center"
      >
        <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-lg text-text mb-2">
          Horarios de atención
        </h3>
        <p className="text-text-light">Lunes a Sábado: 8:00 AM - 6:00 PM</p>
        <p className="text-text-light">Domingos y festivos: Cerrado</p>
      </motion.div>
    </div>
  );
}
