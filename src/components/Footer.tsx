import { useState } from "react";
import { Sparkles, Instagram, Facebook, Youtube } from "lucide-react";
import { LoginDialog } from "./LoginDialog";

export function Footer() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black border-t border-[#D4AF37]/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: "#D4AF37" }} />
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] bg-clip-text text-transparent">
                Lina Hernández
              </span>
            </div>
            <p className="text-gray-400" style={{ fontSize: "0.9rem" }}>
              Transformando estilos, resaltando belleza. Tu salón de confianza en Quito.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-[#F4E5C2]">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: "Servicios", href: "#servicios" },
                { label: "Portafolio", href: "#portafolio" },
                { label: "Nosotros", href: "#nosotros" },
                { label: "Testimonios", href: "#testimonios" },
                { label: "FAQ", href: "#faq" },
                { label: "Contacto", href: "#contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Auth */}
          <div>
            <h4 className="mb-4 text-[#F4E5C2]">Síguenos</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Instagram className="w-5 h-5" style={{ color: "#E91E8C" }} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Facebook className="w-5 h-5" style={{ color: "#D4AF37" }} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#E91E8C]/20 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Youtube className="w-5 h-5" style={{ color: "#E91E8C" }} />
              </a>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="block text-gray-400 hover:text-[#D4AF37] transition-colors text-left"
                style={{ fontSize: "0.9rem" }}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="block text-gray-400 hover:text-[#D4AF37] transition-colors text-left"
                style={{ fontSize: "0.9rem" }}
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#D4AF37]/10 text-center">
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>
            © 2025 Lina Hernández Peluquería. Todos los derechos reservados.
          </p>
        </div>
      </div>
      
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </footer>
  );
}
