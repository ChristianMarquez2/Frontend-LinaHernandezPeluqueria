import { useState } from "react";
import { useAuth } from "../contexts/auth/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const { login, register, sendVerificationEmail } = useAuth();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    cedula: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // ----------------------------------------------------
  // 🔐 Login Handler (Corregido para Try/Catch)
  // ----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Ejecutar login (Lanza error si falla, no devuelve true/false)
      await login(loginData.email, loginData.password);

      // 2. Si llegamos aquí, fue exitoso
      toast.success("¡Bienvenido!", {
        description: "Has iniciado sesión correctamente.",
      });
      
      onOpenChange(false);
      if (onLoginSuccess) onLoginSuccess();

    } catch (err: any) {
      // 3. Capturar error del backend
      console.error("Login Dialog Error:", err);
      const mensaje = err.response?.data?.message || err.message || "Credenciales incorrectas.";
      
      toast.error("Error al iniciar sesión", {
        description: mensaje,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 🧾 Registro Handler
  // ----------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    // Nota: Tu contexto 'register' sí devuelve false si falla (debido al catch interno en authcontext),
    // o el objeto usuario si tiene éxito.
    const result = await register({
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      cedula: registerData.cedula,
      phone: registerData.phone,
      gender:
        registerData.gender === "masculino"
          ? "M"
          : registerData.gender === "femenino"
            ? "F"
            : "O",
      email: registerData.email,
      password: registerData.password,
    });

    if (result) {
      // ✉️ Enviar correo de verificación
      try {
        const emailSent = await sendVerificationEmail(registerData.email);
        if (emailSent) {
          toast.success("¡Cuenta creada!", {
            description: "Revisa tu correo para verificar tu cuenta.",
          });
        } else {
          toast.warning("Cuenta creada", {
            description: "No se pudo enviar el correo, solicítalo luego.",
          });
        }
      } catch (err) {
        console.error("Error enviando verificación:", err);
      }

      onOpenChange(false);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      // Si result es false (según tu AuthProvider)
      toast.error("Error al registrarse", {
        description: "El email o la cédula ya están registrados, o hubo un error de conexión.",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" style={{ color: "#D4AF37" }} />
          </div>
          <DialogTitle className="text-center text-[#F4E5C2]" style={{ fontSize: "1.5rem" }}>
            Accede a tu cuenta
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Inicia sesión o crea una cuenta para reservar tu cita
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
            >
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>

          {/* --- LOGIN TAB --- */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div>
                <label htmlFor="login-email" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Contraseña
                </label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => setShowForgotPassword(true), 200);
                  }}
                  className="text-[#D4AF37] hover:text-[#F4E5C2] transition-colors"
                  style={{ fontSize: "0.875rem" }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all py-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* --- REGISTER TAB --- */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-firstName" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Nombre
                  </label>
                  <Input
                    id="register-firstName"
                    type="text"
                    required
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="Nombre"
                  />
                </div>

                <div>
                  <label htmlFor="register-lastName" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Apellido
                  </label>
                  <Input
                    id="register-lastName"
                    type="text"
                    required
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-cedula" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Cédula
                </label>
                <Input
                  id="register-cedula"
                  type="text"
                  required
                  value={registerData.cedula}
                  onChange={(e) => setRegisterData({ ...registerData, cedula: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="Número de cédula"
                />
              </div>

              <div>
                <label htmlFor="register-gender" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Género
                </label>
                <Select
                  value={registerData.gender}
                  onValueChange={(value) => setRegisterData({ ...registerData, gender: value })}
                  required
                >
                  <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white">
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white">
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="register-email" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Email
                </label>
                <Input
                  id="register-email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="register-phone" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Teléfono
                </label>
                <Input
                  id="register-phone"
                  type="tel"
                  required
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="+593 999 999 999"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Contraseña
                </label>
                <Input
                  id="register-password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="register-confirm" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                  Confirmar contraseña
                </label>
                <Input
                  id="register-confirm"
                  type="password"
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all py-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setTimeout(() => onOpenChange(true), 200);
        }}
      />
    </Dialog>
  );
}