import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../../../config/api";
import { authService } from "../../../contexts/auth/service";
import {
  getAllUsers,
  deactivateUser,
  activateUser,
  updateUserProfile
} from "../../../services/userService";
import { User, UserFormData, ValidationErrors, mapRoleToBackend } from "./types";

export function useUserLogic() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("accessToken") ?? "";

  // 🔄 Cargar usuarios
  const fetchUsers = useCallback(async () => {
    const token = getToken();
    setLoading(true);
    try {
      // Usamos tu servicio existente - aumentar el límite para ver todos los usuarios
      const res = await getAllUsers(1, 1000, token);
      if (!res) {
        toast.error("No se pudieron cargar los usuarios");
        return;
      }
      console.log(`📊 Usuarios cargados: ${res.data.length} de ${res.meta.total} totales`);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🛡️ Validaciones
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,15}$/;
  const cedulaRegex = /^\d{10}$/;
  const telefonoRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const validateField = (field: keyof UserFormData, value: string, isEditing: boolean) => {
    switch (field) {
      case "nombre":
      case "apellido":
        if (!value) return "Requerido";
        if (!nameRegex.test(value)) return "Mínimo 2 letras, máximo 15 caracteres";
        return "";
      case "cedula":
        if (!value) return "Requerido";
        if (!cedulaRegex.test(value)) return "Cédula debe tener exactamente 10 dígitos numéricos";
        return "";
      case "telefono":
        if (!value) return "Requerido";
        if (!telefonoRegex.test(value)) return "Teléfono debe tener 10 dígitos";
        return "";
      case "genero":
        if (!value) return "Requerido";
        return "";
      case "email":
        if (!value) return "Requerido";
        if (!emailRegex.test(value)) return "Email inválido";
        return "";
      case "password":
        if (isEditing) return ""; // Opcional al editar
        if (!value) return "Requerido";
        if (!passwordRegex.test(value))
          return "Mín 8 car., con mayúscula, minúscula, número y caracter especial";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (formData: UserFormData, isEditing: boolean): ValidationErrors => {
    const errors: ValidationErrors = {};
    const fields = ["nombre", "apellido", "cedula", "telefono", "genero", "email", "password"] as const;

    fields.forEach(field => {
      const error = validateField(field, formData[field] as string, isEditing);
      if (error) errors[field] = error;
    });

    return errors;
  };

  // 💾 Guardar (Crear / Editar)
  const handleSaveUser = async (formData: UserFormData, editingId: string | null) => {
    const token = getToken();
    if (!token) {
      toast.error("Token no disponible");
      return false;
    }

    try {
      if (editingId) {
        // --- EDITAR PERFIL (ADMIN / GERENTE) ---
        const payload: any = {
          nombre: formData.nombre || undefined,
          apellido: formData.apellido || undefined,
          cedula: formData.cedula || undefined,
          telefono: formData.telefono || undefined,
          genero: formData.genero || undefined,
        };
        if (formData.password) payload.password = formData.password;

        const updated = await updateUserProfile(editingId, payload, token);

        setUsers((prev) =>
          prev.map((p) =>
            p._id === editingId
              ? { ...p, ...((updated as any).data ?? updated) }
              : p
          )
        );

        toast.success("Usuario actualizado");

      } else {
        // --- CREAR ---
        const backendRole = mapRoleToBackend(formData.role);
        if (!backendRole) {
          toast.error("Selecciona un rol válido");
          return false;
        }

        const res = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            password: formData.password,
            role: backendRole,
            isActive: formData.isActive,
            cedula: formData.cedula,
            telefono: formData.telefono,
            genero: formData.genero,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Error creando usuario");
        }

        const data = await res.json();
        
        // 📧 Enviar verificación si el nuevo usuario es gerente o estilista
        if (formData.role === 'manager' || formData.role === 'stylist') {
          try {
            await authService.sendVerificationEmail(formData.email);
            toast.message('Verificación enviada', {
              description: 'Se envió un correo para verificar la cuenta.',
            });
          } catch (e) {
            console.error('Error enviando verificación:', e);
            toast.error('No se pudo enviar el correo de verificación');
          }
        }

        // Refrescamos desde el backend para evitar filas transitorias vacías
        await fetchUsers();
        toast.success("Usuario creado");
      }
      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error guardando usuario");
      return false;
    }
  };

  // 🛠️ Cambiar estado
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar";

    const token = getToken();
    try {
      if (currentStatus) {
        await deactivateUser(id, token);
        toast.success("Usuario desactivado");
      } else {
        await activateUser(id, token);
        toast.success("Usuario activado");
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      console.error(err);
      toast.error(`No se pudo ${action} el usuario`);
    }
  };

  return {
    users,
    loading,
    validateField,
    validateForm,
    handleSaveUser,
    handleToggleStatus,
  };
}