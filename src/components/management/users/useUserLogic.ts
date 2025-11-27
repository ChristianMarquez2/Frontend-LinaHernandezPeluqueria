import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../../../config/api";
import { 
  getAllUsers, 
  deactivateUser, 
  activateUser 
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
      // Usamos tu servicio existente
      const res = await getAllUsers(1, 50, token);
      if (!res) {
        toast.error("No se pudieron cargar los usuarios");
        return;
      }
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
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{1,15}$/;
  const cedulaRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const validateField = (field: keyof UserFormData, value: string, isEditing: boolean) => {
    switch (field) {
      case "nombre":
      case "apellido":
        if (!value) return "Requerido";
        if (!nameRegex.test(value)) return "Solo letras, máximo 15 caracteres";
        return "";
      case "cedula":
        if (!value) return "Requerido";
        if (!cedulaRegex.test(value)) return "Cédula debe tener exactamente 10 dígitos numéricos";
        return "";
      case "email":
        if (!value) return "Requerido";
        if (!emailRegex.test(value)) return "Email debe contener @ y terminar en .com";
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
    const fields = ["nombre", "apellido", "cedula", "email", "password"] as const;
    
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
        // --- EDITAR ---
        const backendRole = mapRoleToBackend(formData.role);
        const payload: any = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          isActive: formData.isActive,
          cedula: formData.cedula,
        };
        if (backendRole) payload.role = backendRole;

        const res = await fetch(`${API_BASE_URL}/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Error actualizando usuario");
        }

        const updated = await res.json();
        // Optimistic UI Update
        setUsers((prev) =>
          prev.map((p) =>
            p._id === editingId
              ? { ...p, ...(updated.data ?? updated) }
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
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Error creando usuario");
        }

        const created = await res.json();
        const newUser = created.data ?? created;
        setUsers((prev) => [newUser, ...prev]);
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
    if (!confirm(`¿Seguro que deseas ${action} este usuario?`)) return;

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