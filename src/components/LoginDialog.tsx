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
        style: { color: "black", background: "#10b981" },
        descriptionClassName: "text-black",
      });

      onOpenChange(false);
      if (onLoginSuccess) onLoginSuccess();

    } catch (err: any) {
      // 3. Capturar error del backend
      console.error("Login Dialog Error:", err);
      const mensaje = err.response?.data?.message || err.message || "Credenciales incorrectas.";

      toast.error("Error al iniciar sesión", {
        description: mensaje,
        style: { color: "black", background: "#ef4444" },
        descriptionClassName: "text-black",
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

    // Validaciones
    if (!registerData.firstName.trim()) {
      toast.error("El nombre es requerido", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    if (!registerData.lastName.trim()) {
      toast.error("El apellido es requerido", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    if (registerData.cedula.length !== 10) {
      toast.error("La cédula debe tener exactamente 10 dígitos", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    if (!registerData.gender) {
      toast.error("Debes seleccionar un género", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      toast.error("Por favor ingresa un email válido", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    // Validar teléfono: solo números, exactamente 10 dígitos
    if (!/^\d{10}$/.test(registerData.phone)) {
      toast.error("El teléfono debe tener exactamente 10 dígitos", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    // Validar contraseña: mínimo 8 caracteres
    if (registerData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    // Validar que la contraseña tenga mayúsculas, minúsculas y números
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(registerData.password)) {
      toast.error("La contraseña debe contener mayúsculas, minúsculas y números", { style: { color: "black", background: "#ef4444" } });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Las contraseñas no coinciden", { style: { color: "black", background: "#ef4444" } });
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
            style: { color: "black", background: "#10b981" },
            descriptionClassName: "text-black",
          });
        } else {
          toast.warning("Cuenta creada", {
            description: "No se pudo enviar el correo, solicítalo luego.",
            style: { color: "black", background: "#f59e0b" },
            descriptionClassName: "text-black",
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
        style: { color: "black", background: "#ef4444" },
        descriptionClassName: "text-black",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/30 text-white
                 max-h-[80vh] overflow-y-auto"
      >
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
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
            >
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
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
                  autoComplete="username"
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
                  autoComplete="current-password"
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
                    autoComplete="given-name"
                    required
                    value={registerData.firstName}
                    maxLength={20} // 1. Límite visual de 20 caracteres
                    onChange={(e) => {
                      const value = e.target.value;
                      // 2. Validación: Solo letras (a-z), acentos, Ñ y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                        setRegisterData({ ...registerData, firstName: value });
                      }
                    }}
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
                    autoComplete="family-name"
                    required
                    value={registerData.lastName}
                    maxLength={20}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validación: Solo letras, tildes y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                        setRegisterData({ ...registerData, lastName: value });
                      }
                    }}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-cedula" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Cédula
                  </label>
                  <Input
                    id="register-cedula"
                    type="text"
                    autoComplete="off"
                    required
                    value={registerData.cedula}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setRegisterData({ ...registerData, cedula: value });
                      }
                    }}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="Número de cédula"
                  />
                </div>

                <div>
                  <label htmlFor="register-gender" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Género
                  </label>
                  <Select 
                    name="gender"
                    value={registerData.gender}
                    onValueChange={(value) => setRegisterData({ ...registerData, gender: value })}
                    required
                  >
                    <SelectTrigger 
                    id="register-gender" 
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white">
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-email" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Email
                  </label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
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
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={registerData.phone}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permite dígitos numéricos
                      if (/^\d*$/.test(value)) {
                        setRegisterData({ ...registerData, phone: value });
                      }
                    }}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="9999999999"
                  />
                  <p className="text-xs text-gray-400 mt-1">10 dígitos sin espacios ni caracteres especiales</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-password" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Contraseña
                  </label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-400 mt-1">Mín. 8 caracteres, mayúsculas, minúsculas y números</p>
                </div>

                <div>
                  <label htmlFor="register-confirm" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                    Confirmar contraseña
                  </label>
                  <Input
                    id="register-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, confirmPassword: e.target.value })
                    }
                    className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                    placeholder="••••••••"
                  />
                </div>
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