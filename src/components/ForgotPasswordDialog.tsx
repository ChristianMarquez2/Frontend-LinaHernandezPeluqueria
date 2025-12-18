import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Mail, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

type Step = "email" | "code" | "newPassword" | "success";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  onBackToLogin,
}: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  };

  // 📨 Paso 1: Enviar código al correo
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.forgotPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al enviar código");

      toast.success("Código enviado", {
        description: `Hemos enviado un código de verificación a ${email}`,
      });
      setStep("code");
    } catch (err: any) {
      toast.error("Error al enviar código", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔁 Reenviar código
  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.forgotPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo reenviar");

      toast.success("Código reenviado", {
        description: `Hemos enviado un nuevo código a ${email}`,
      });
    } catch (err: any) {
      toast.error("Error al reenviar código", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Paso 2: Verificar código localmente
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Código inválido", {
        description: "El código debe tener 6 dígitos.",
      });
      return;
    }
    setStep("newPassword");
  };

  // 🔒 Paso 3: Enviar nueva contraseña al backend
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Contraseña muy corta", {
        description: "Debe tener al menos 8 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden", {
        description: "Por favor verifica que ambas sean iguales.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.resetPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");

      toast.success("Contraseña actualizada", {
        description: "Tu contraseña fue cambiada exitosamente.",
      });

      setStep("success");
    } catch (err: any) {
      toast.error("Error al cambiar contraseña", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 Paso 4: Confirmar éxito
  const handleSuccessClose = () => {
    resetForm();
    onOpenChange(false);
    onBackToLogin();
    toast.success("¡Listo!", {
      description: "Ya puedes iniciar sesión con tu nueva contraseña.",
    });
  };

  // 🔙 Navegación entre pasos
  const handleBackToEmail = () => {
    setCode("");
    setStep("email");
  };

  const handleBackToCode = () => {
    setNewPassword("");
    setConfirmPassword("");
    setStep("code");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[480px] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#D4AF37]/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            {step === "email" && <Mail className="w-6 h-6" style={{ color: "#D4AF37" }} />}
            {step === "code" && <ShieldCheck className="w-6 h-6" style={{ color: "#D4AF37" }} />}
            {step === "newPassword" && <Lock className="w-6 h-6" style={{ color: "#D4AF37" }} />}
            {step === "success" && <CheckCircle2 className="w-6 h-6" style={{ color: "#D4AF37" }} />}
          </div>
          <DialogTitle className="text-center text-[#F4E5C2]" style={{ fontSize: "1.5rem" }}>
            {step === "email" && "Recuperar Contraseña"}
            {step === "code" && "Verificar Código"}
            {step === "newPassword" && "Nueva Contraseña"}
            {step === "success" && "¡Contraseña Actualizada!"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {step === "email" && "Ingresa tu correo para recibir un código de verificación"}
            {step === "code" && "Ingresa el código de 6 dígitos enviado a tu correo"}
            {step === "newPassword" && "Ingresa tu nueva contraseña"}
            {step === "success" && "Tu contraseña ha sido actualizada correctamente"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="forgot-email" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                Correo Electrónico
              </label>
              <Input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                placeholder="tu@email.com"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                  onBackToLogin();
                }}
                variant="outline"
                className="flex-1 bg-transparent border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>Enviar Código</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Code Verification */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="verification-code" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                Código de Verificación
              </label>
              <Input
                id="verification-code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white text-center tracking-widest"
                placeholder="000000"
                style={{ fontSize: "1.5rem", letterSpacing: "0.5rem" }}
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSubmitting}
                className="text-[#D4AF37] hover:text-[#F4E5C2] transition-colors disabled:opacity-50"
                style={{ fontSize: "0.875rem" }}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleBackToEmail}
                variant="outline"
                className="flex-1 bg-transparent border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>Verificar Código</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "newPassword" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="new-password" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                Nueva Contraseña
              </label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block mb-2 text-[#F4E5C2]" style={{ fontSize: "0.9rem" }}>
                Confirmar Nueva Contraseña
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white"
                placeholder="Confirma tu contraseña"
              />
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-sm">Las contraseñas no coinciden</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleBackToCode}
                variant="outline"
                className="flex-1 bg-transparent border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Actualizando...
                  </>
                ) : (
                  <>Cambiar Contraseña</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-6 mt-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12" style={{ color: "#D4AF37" }} />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[#F4E5C2]">Tu contraseña ha sido actualizada exitosamente.</p>
              <p className="text-gray-400" style={{ fontSize: "0.875rem" }}>
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            <Button
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black hover:shadow-xl hover:shadow-[#D4AF37]/50 transition-all py-6"
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
