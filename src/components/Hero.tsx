import { useState } from "react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { MessageCircle, Calendar } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LoginDialog } from "./LoginDialog";

export function Hero() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/593980865549?text=Hola,%20me%20gustaría%20reservar%20una%20cita", "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759134155377-4207d89b39ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoYWlyJTIwc2Fsb24lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjExMzY4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Luxury Salon Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#9D8EC1]/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 bg-gradient-to-r from-[#D4AF37] via-[#E5E4E2] to-[#B8A9D4] bg-clip-text text-transparent"
            style={{ fontSize: "3.5rem", lineHeight: "1.2", fontWeight: "700" }}
          >
            Transformamos tu estilo, resalta tu belleza
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-300 mb-10 max-w-2xl mx-auto"
            style={{ fontSize: "1.25rem" }}
          >
            Expertos en color, corte y estilismo. Tu belleza es nuestro arte.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={() => setIsLoginOpen(true)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all px-8 py-6"
              style={{ fontSize: "1.125rem" }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reserva tu cita
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsApp}
              className="border-[#B8A9D4] text-[#B8A9D4] hover:bg-[#9D8EC1]/10 hover:shadow-lg hover:shadow-[#B8A9D4]/30 transition-all px-8 py-6"
              style={{ fontSize: "1.125rem" }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contáctanos por WhatsApp
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
        </motion.div>
      </div>
      
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </section>
  );
}
