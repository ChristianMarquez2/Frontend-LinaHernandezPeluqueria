import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config/api';
import { Stylist, StylistFormData, ValidationErrors } from './types';

export function useStylistLogic() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  // 🔄 Cargar estilistas
  const fetchStylists = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/stylists`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('No autorizado');
        throw new Error('Error al obtener estilistas');
      }

      const data = await res.json();
      setStylists(Array.isArray(data) ? data : (data.data || []));

    } catch (err: any) {
      console.error('❌ Error al cargar estilistas:', err);
      if (err.message !== 'No autorizado') {
        toast.error('Error al cargar la lista de estilistas');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStylists();
  }, [fetchStylists]);

  // 🛡️ Validaciones
  const validations = {
    firstName: (value: string) => {
      if (!value.trim()) return 'El nombre es requerido';
      if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) return 'Solo se permiten letras';
      if (value.length > 20) return 'Máximo 20 caracteres';
      return null;
    },
    lastName: (value: string) => {
      if (!value.trim()) return 'El apellido es requerido';
      if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(value)) return 'Solo se permiten letras';
      if (value.length > 20) return 'Máximo 20 caracteres';
      return null;
    },
    cedula: (value: string) => {
      if (!value.trim()) return 'Requerido';
      if (!/^\d+$/.test(value)) return 'Solo números';
      if (value.length !== 10) return 'Debe tener 10 dígitos';
      return null;
    },
    phone: (value: string) => {
      if (!value.trim()) return 'Requerido';
      if (!/^\d+$/.test(value)) return 'Solo números';
      if (value.length !== 10) return 'Debe tener 10 dígitos';
      return null;
    },
    email: (value: string) => {
      if (!value.trim()) return 'El email es requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
      return null;
    },
    password: (value: string, isEditing: boolean) => {
      if (isEditing && !value) return null;
      if (!isEditing && !value) return 'La contraseña es requerida';

      if (value) {
        if (value.length < 8) return 'Mínimo 8 caracteres';
        if (!/(?=.*[a-z])/.test(value)) return 'Falta minúscula';
        if (!/(?=.*[A-Z])/.test(value)) return 'Falta mayúscula';
        if (!/(?=.*\d)/.test(value)) return 'Falta número';
        if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) return 'Falta carácter especial';
      }
      return null;
    },
    gender: (value: string) => (!value ? 'Seleccione un género' : null),
    // VALIDACIÓN CORREGIDA: Catálogo
    catalog: (value: string) => (!value ? 'Seleccione un catálogo' : null),
  };

  const validateField = (name: keyof StylistFormData, value: string, isEditing: boolean) => {
    // @ts-ignore
    const validator = validations[name];
    if (validator) return validator(value, isEditing);
    return null;
  };

  const validateForm = (formData: StylistFormData, isEditing: boolean): ValidationErrors => {
    const errors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof StylistFormData;
      const error = validateField(fieldName, formData[fieldName], isEditing);
      if (error) errors[fieldName] = error;
    });
    return errors;
  };

  // 💾 Guardar (Create / Update)
  const handleSaveStylist = async (formData: StylistFormData, editingId: string | null) => {
    const token = getToken();
    if (!token) return false;

    try {
      if (editingId) {
        // --- MODO EDICIÓN ---

        // 1. Actualizar Datos Personales (Endpoint /users)
        const userPayload = {
          nombre: formData.firstName,
          apellido: formData.lastName,
          email: formData.email,
          telefono: formData.phone,
          cedula: formData.cedula,
          genero: formData.gender,
          // IMPORTANTE: Tu backend pide 'catalogs' como array de IDs
          catalogs: [formData.catalog]
        };

        const resUser = await fetch(`${API_BASE_URL}/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        });

        const createPayload = {
          nombre: formData.firstName,
          apellido: formData.lastName,
          cedula: formData.cedula,
          telefono: formData.phone,
          genero: formData.gender,
          email: formData.email,
          password: formData.password,
          role: "ESTILISTA", // Forzamos el rol para el backend
          catalogs: [formData.catalog] // Enviamos el ID dentro de un array

        };
        

        if (!resUser.ok) throw new Error('Error al actualizar datos personales');

        // 2. Actualizar Catálogos (Endpoint /stylists/:id/services)
        // 🔥 CORRECCIÓN: Enviamos 'catalogs' (array)
        const resServices = await fetch(`${API_BASE_URL}/stylists/${editingId}/services`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ catalogs: [formData.catalog] }),
        });

        if (!resServices.ok) {
          const errData = await resServices.json();
          console.warn('Backend error:', errData);
          throw new Error(errData.message || 'Error al actualizar catálogos');
        }

        toast.success('Estilista actualizado correctamente');

      } else {
        // --- MODO CREACIÓN ---
        const res = await fetch(`${API_BASE_URL}/stylists`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: formData.firstName,
            apellido: formData.lastName,
            cedula: formData.cedula,
            telefono: formData.phone,
            genero: formData.gender,
            email: formData.email,
            password: formData.password,
            // 🔥 CORRECCIÓN: Enviamos 'catalogs' (array), no servicesOffered
            catalogs: [formData.catalog],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Error al crear estilista');
        }
        toast.success('Estilista creado exitosamente');
      }

      fetchStylists();
      return true;

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ocurrió un error inesperado');
      return false;
    }
  };

  // 🗑️ Eliminar (Soft Delete)
  const handleDeleteStylist = async (id: string) => {
    const token = getToken();
    try {
      // Usamos el endpoint de user para desactivar
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (!res.ok) throw new Error('Error al desactivar');

      toast.success('Estilista desactivado');
      fetchStylists();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo realizar la acción');
    }
  };

  return {
    stylists,
    loading,
    validateField,
    validateForm,
    handleSaveStylist,
    handleDeleteStylist
  };
}