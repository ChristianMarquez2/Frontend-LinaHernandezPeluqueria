import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Service, ServiceFormData } from "./types";
// 👇 IMPORTAMOS EL CONTEXTO DE CATEGORÍAS
import { useCategoriesContext } from "../../../contexts/data/context/CategoriesContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useServiceLogic() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // 👇 Consumimos las categorías directamente del contexto
  const { 
    categories, 
    loading: categoriesLoading, 
    refreshCategories 
  } = useCategoriesContext();

  const loading = servicesLoading || categoriesLoading;

  // Obtener token (Helper)
  const getToken = () => 
    localStorage.getItem("accessToken") ||
    JSON.parse(localStorage.getItem("currentUser") || "{}")?.accessToken;

  // 🔄 Cargar servicios (Esto sí se mantiene local porque no hicimos ServicesContext global aún)
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/v1/services`);
      if (!res.ok) throw new Error("Error al obtener servicios");
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      toast.error("Error al cargar servicios", { description: err.message });
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // 🔄 Cargar todo inicial
  useEffect(() => {
    fetchServices();
    // Aseguramos que las categorías estén actualizadas
    refreshCategories();
  }, [fetchServices, refreshCategories]);

  // 💾 Guardar (Crear o Editar)
  const handleSaveService = async (formData: ServiceFormData, editingId: string | null) => {
    const token = getToken();
    const body = {
      nombre: formData.nombre,
      codigo: formData.codigo,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      duracionMin: parseInt(formData.duracionMin),
      activo: formData.activo,
      categoria: formData.categoria,
    };

    const url = editingId
      ? `${API_URL}/v1/services/${editingId}`
      : `${API_URL}/v1/services`;

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar servicio");

      toast.success(
        editingId
          ? "Servicio actualizado exitosamente"
          : "Servicio creado exitosamente"
      );

      fetchServices(); // Recargar lista
      return true; // Éxito
    } catch (err: any) {
      toast.error("Error al guardar servicio", { description: err.message });
      return false; // Error
    }
  };

  // 🗑️ Eliminar
  const handleDeleteService = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este servicio?")) return;

    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/v1/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al eliminar servicio");

      toast.success("Servicio eliminado exitosamente");
      fetchServices();
    } catch (err: any) {
      toast.error("Error al eliminar servicio", { description: err.message });
    }
  };

  // Helper para obtener nombre de categoría
  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return "Sin categoría";
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.nombre : "Categoría no encontrada";
  };

  return {
    services,
    categories, // Estas ahora vienen del Contexto
    loading,
    handleSaveService,
    handleDeleteService,
    getCategoryName,
  };
}