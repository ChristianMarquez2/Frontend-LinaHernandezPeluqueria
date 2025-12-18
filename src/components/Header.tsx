import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/index";
import { Button } from "./ui/button";
import { Menu, X, Sparkles, User, LogOut, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LoginDialog } from "./LoginDialog";
import { UserProfile } from "./UserProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Servicios", href: "#servicios" },
    { label: "Portafolio", href: "#portafolio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Testimonios", href: "#testimonios" },
    { label: "FAQ", href: "#faq" },
    { label: "Contacto", href: "#contacto" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
        }`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Ajustado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/logo.png"
            alt="Lina Hernández Peluquería"
            /* Aumentamos de h-12 a h-20 en móvil y h-32 en escritorio.
               Añadimos drop-shadow para que resalte el dorado sobre el fondo oscuro.
            */
            className="h-20 md:h-32 w-auto transition-all duration-300 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          />
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
              href={item.href}
              className="text-gray-300 font-medium hover:text-[#D4AF37] transition-colors cursor-pointer text-lg"
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* CTA Button / User Menu Desktop */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-4"
        >
          {!isAuthenticated ? (
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all"
            >
              Reservar cita
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsLoginOpen(true)}
                variant="outline"
                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reservar cita
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user?.firstName} {user?.lastName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white">
                  <DropdownMenuLabel className="text-[#F4E5C2]">Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#D4AF37]/20" />
                  <DropdownMenuItem
                    onClick={() => setIsProfileOpen(true)}
                    className="focus:bg-[#D4AF37]/20 focus:text-white cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      /* Navigate to appointments */
                    }}
                    className="focus:bg-[#D4AF37]/20 focus:text-white cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Mis Citas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#D4AF37]/20" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/20 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 backdrop-blur-md border-t border-[#D4AF37]/20"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  href={item.href}
                  className="text-gray-300 hover:text-[#D4AF37] transition-colors py-2 cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
              {!isAuthenticated ? (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all w-full"
                >
                  Reservar cita
                </Button>
              ) : (
                <>
                  <div className="border-t border-[#D4AF37]/20 pt-4">
                    <p className="text-[#F4E5C2] mb-3">{user?.firstName} {user?.lastName}</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsProfileOpen(true);
                        }}
                        variant="outline"
                        className="border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10 w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Button>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsLoginOpen(true);
                        }}
                        variant="outline"
                        className="border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10 w-full"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Mis Citas
                      </Button>
                      <Button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
      />
      <UserProfile open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </header>
  );
}
