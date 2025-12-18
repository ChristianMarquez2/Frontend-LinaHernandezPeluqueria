import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Service, ServiceFormData } from "../../../contexts/data/types";
import { useCategoriesContext } from "../../../contexts/data/context/CategoriesContext";
import { dataService } from '../../../contexts/data/service';

// 1. Corrección de URL para evitar el error /api/api/v1
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/v1` : `${BASE_URL}/api/v1`;

export function useServiceLogic() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Consumimos el contexto de categorías para la búsqueda inversa y el refresco
  const { 
    categories, 
    loading: categoriesLoading, 
    refreshCategories 
  } = useCategoriesContext();

  const loading = servicesLoading || categoriesLoading;
  const token = localStorage.getItem("accessToken");

  // 2. Carga de servicios usando el dataService centralizado
  const fetchServices = useCallback(async () => {
    if (!token) return;
    try {
      setServicesLoading(true);
      const data = await dataService.fetchServices(token);
      setServices(data);
    } catch (err: any) {
      toast.error("Error al cargar servicios", { description: err.message });
    } finally {
      setServicesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
    refreshCategories();
  }, [fetchServices, refreshCategories]);

  // 3. Guardado con vinculación automática a Catálogo
  const handleSaveService = async (formData: ServiceFormData, editingId: string | null) => {
    if (!token) return false;

    try {
      // A. Estructura del cuerpo para el Backend (Service Model)
      const serviceBody = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        precio: parseFloat(String(formData.precio)),
        duracionMin: parseInt(String(formData.duracionMin)),
        activo: formData.activo,
      };

      const url = editingId ? `${API_URL}/services/${editingId}` : `${API_URL}/services`;
      
      // Primera petición: Crear o Actualizar el Servicio
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(serviceBody),
      });

      const savedService = await res.json();
      if (!res.ok) throw new Error(savedService.message || "Error al guardar el servicio");

      // B. Lógica de Vinculación con Categoría (El Frontend actúa como puente)
      if (formData.categoria) {
        const serviceId = editingId || savedService._id;

        // Si es edición, limpiamos el servicio de categorías previas para evitar duplicidad
        if (editingId) {
          const oldCategories = categories.filter(cat =>
            cat.services.some((s: any) => (typeof s === 'object' ? s._id : s) === editingId)
          );

          for (const oldCat of oldCategories) {
            if (oldCat._id !== formData.categoria) {
              await fetch(`${API_URL}/catalog/${oldCat._id}/services/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ services: [editingId] }),
              });
            }
          }
        }

        // Segunda petición: Vincular el servicio al catálogo seleccionado
        const linkRes = await fetch(`${API_URL}/catalog/${formData.categoria}/services/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ services: [serviceId] }),
        });

        if (!linkRes.ok) {
          console.warn("Servicio guardado, pero falló la vinculación al catálogo.");
        }
      }

      toast.success(editingId ? "Servicio actualizado" : "Servicio creado y vinculado");

      // 4. Sincronización de la UI
      fetchServices();
      refreshCategories(); // Crucial para que el contador de la pestaña categorías suba

      return true;
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      return false;
    }
  };

  // 5. Borrado con limpieza de catálogo
  const handleDeleteService = async (id: string) => {
    if (!token || !window.confirm("¿Estás seguro de eliminar este servicio?")) return;
    
    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo eliminar el servicio");

      toast.success("Servicio eliminado correctamente");
      
      // Refrescamos ambos para limpiar huellas en categorías
      fetchServices();
      refreshCategories();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  /**
   * 6. BÚSQUEDA INVERSA (Solución al "Sin categoría")
   * Como el modelo Service no conoce su categoría, buscamos en qué categoría
   * está registrado el ID de este servicio.
   */
  const getCategoryName = (serviceId: string) => {
    if (!serviceId) return "Sin categoría";

    const categoryFound = categories.find((cat) =>
      cat.services.some((s: any) => {
        // Manejamos si el backend devuelve el array de servicios populado o solo IDs
        const idInCatalog = typeof s === 'object' ? s._id : s;
        return idInCatalog === serviceId;
      })
    );

    return categoryFound ? categoryFound.nombre : "Sin categoría";
  };

  return { 
    services, 
    categories, 
    loading, 
    handleSaveService, 
    handleDeleteService, 
    getCategoryName 
  };
}