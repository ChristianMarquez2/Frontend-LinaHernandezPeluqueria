// UserProfile.tsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/auth/index";
import { authService } from "../contexts/auth/service";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "./ui/dialog";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PasswordInput } from "./ui/password-input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

import { User, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------- VALIDACIONES ----------
const validatePhone = (value: string) => /^[0-9]{9,15}$/.test(value);
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePasswordStrong = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#:;.,=\-])[A-Za-z\d@$!%*?&_#:;.,=\-]{8,}$/;
  return regex.test(password);
};

// -----------------------------------
export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const { user, updateProfile } = useAuth();

  // Perfil
  const [profileData, setProfileData] = useState({
    email: "",
    phone: "",
    gender: "",
    firstName: "",
    lastName: "",
    cedula: "",
  });

  // Contraseña
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos reales del usuario
  useEffect(() => {
    if (user) {
      const mapGenderFromBackend = (value: string | undefined) => {
        const v = (value || "").toLowerCase();
        if (v === "f" || v.includes("fem")) return "femenino";
        if (v === "m" || v.includes("masc")) return "masculino";
        if (v === "o" || v.includes("otro")) return "otro";
        if (v) return "prefiero-no-decir";
        return "";
      };

      setProfileData({
        email: user.email || "",
        phone: user.phone || "",
        gender: mapGenderFromBackend(user.gender),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        cedula: user.cedula || "",
      });
    }
  }, [user, open]);

  // --------- PERFIL: SOLO CAMPOS MODIFICADOS ----------
  const changedFields = useMemo(() => {
    if (!user) return {};

    const result: any = {};

    if (profileData.email !== user.email) result.email = profileData.email;
    if (profileData.phone !== user.phone) result.phone = profileData.phone;

    // El backend usa F/M/O
    if (profileData.gender !== user.gender) {
      const mapGender = profileData.gender.toLowerCase();
      result.genero =
        mapGender.includes("fem")
          ? "F"
          : mapGender.includes("masc")
            ? "M"
            : mapGender.includes("otro")
              ? "O"
              : undefined;
    }

    return result;
  }, [user, profileData]);

  // ---------- ACTUALIZAR PERFIL ----------
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (Object.keys(changedFields).length === 0) {
      toast.info("No hay cambios por guardar");
      return;
    }

    // Validaciones
    if (
      changedFields.email &&
      changedFields.email !== user.email &&
      !validateEmail(changedFields.email)
    ) {
      return toast.error("Correo inválido");
    }

    if (changedFields.phone && !validatePhone(changedFields.phone)) {
      return toast.error("Teléfono inválido", {
        description: "Debe tener entre 9 y 15 dígitos.",
      });
    }

    setLoading(true);

    const ok = await updateProfile(changedFields);

    if (ok) {
      toast.success("Perfil actualizado");
    } else {
      toast.error("No se pudo actualizar", {
        description: "El correo podría estar en uso.",
      });
    }

    setLoading(false);
  };

  // ---------- ACTUALIZAR CONTRASEÑA ----------
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordStrong(passwordData.newPassword)) {
      return toast.error("Contraseña insegura", {
        description:
          "Debe tener 8 caracteres, mayúscula, minúscula, número y símbolo.",
      });
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    setLoading(true);

    // Aquí debes llamar a tu endpoint real cuando esté listo
    await new Promise((r) => setTimeout(r, 1000));

    toast.success("Contraseña actualizada correctamente");

    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });

    setLoading(false);
  };

  // ---------------------------------
  // ----------- UI ------------------
  // ---------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/40 text-white max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="w-6 h-6" style={{ color: "#D4AF37" }} />
          </div>
          <DialogTitle className="text-center text-[#F4E5C2] text-xl">
            Mi Perfil
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Gestiona tu información personal y seguridad
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 bg-black/50">
            <TabsTrigger
              value="profile"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
            >
              Datos Personales
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D4AF37] data-[state=active]:to-[#F4E5C2] data-[state=active]:text-black"
            >
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* ---------- TAB PERFIL ---------- */}
          <TabsContent value="profile">
            <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">

              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-3 text-xs text-gray-300">
                Solo puedes modificar correo, teléfono y género.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#F4E5C2] text-sm">Nombre</label>
                  <Input
                    value={profileData.firstName}
                    disabled
                    className="bg-black/30 border-[#D4AF37]/20 cursor-not-allowed text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-[#F4E5C2] text-sm">Apellido</label>
                  <Input
                    value={profileData.lastName}
                    disabled
                    className="bg-black/30 border-[#D4AF37]/20 cursor-not-allowed text-gray-400"
                  />
                </div>
              </div>

              {profileData.cedula && (
                <div>
                  <label className="text-[#F4E5C2] text-sm">Cédula</label>
                  <Input
                    value={profileData.cedula}
                    disabled
                    className="bg-black/30 border-[#D4AF37]/20 cursor-not-allowed text-gray-400"
                  />
                </div>
              )}

              {/* Género */}
              <div>
                <label className="text-[#F4E5C2] text-sm">Género</label>
                <Select
                  value={profileData.gender}
                  onValueChange={(gender: string) =>
                    setProfileData({ ...profileData, gender })
                  }

                >
                  <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white">
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="prefiero-no-decir">
                      Prefiero no decir
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <label className="text-[#F4E5C2] text-sm flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <Input
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      email: e.target.value,
                    })
                  }
                  className="bg-black/50 border-[#D4AF37]/30"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-[#F4E5C2] text-sm flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Teléfono
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="bg-black/50 border-[#D4AF37]/30"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black py-6"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </TabsContent>

          {/* ---------- TAB CONTRASEÑA ---------- */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordUpdate} className="space-y-4 mt-4">
              {/* Hidden email field for password managers */}
              <input
                type="email"
                autoComplete="email"
                value={user?.email || ""}
                readOnly
                hidden
              />

              <div>
                <label className="text-[#F4E5C2] text-sm">Nueva Contraseña</label>
                <PasswordInput
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  inputClassName="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="text-[#F4E5C2] text-sm">
                  Confirmar Contraseña
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  inputClassName="bg-black/50 border-[#D4AF37]/30 focus:border-[#D4AF37]"
                  required
                />
              </div>

              {passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-400 text-sm">
                    Las contraseñas no coinciden
                  </p>
                )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4E5C2] text-black py-6"
              >
                {loading
                  ? "Actualizando contraseña..."
                  : "Cambiar Contraseña"}
              </Button>
            </form>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
