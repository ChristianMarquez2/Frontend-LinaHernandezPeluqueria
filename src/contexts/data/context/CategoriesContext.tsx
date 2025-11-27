import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext"; // Ajusta ruta si es necesario
import { catalogService } from "../../../services/catalog.service"; // Ajusta ruta
import { Category, PaginationMeta, CreateCategoryDTO, UpdateCategoryDTO } from "../types";

interface CategoriesContextType {
  categories: Category[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  refreshCategories: (page?: number, search?: string) => Promise<void>;
  createCategory: (data: CreateCategoryDTO) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryDTO) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");

  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LEER DATOS ---
  const refreshCategories = useCallback(async (page = 1, search = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await catalogService.getAll(token, page, search);
      setCategories(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      console.error("Error cargando categorías:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Carga inicial
  useEffect(() => {
    if (user) refreshCategories();
  }, [user, refreshCategories]);

  // --- ACCIONES DE ESCRITURA ---
  
  const createCategory = async (data: CreateCategoryDTO) => {
    if (!token) return;
    try {
      await catalogService.create(token, data);
      await refreshCategories(); // Recargar lista
    } catch (err: any) {
      throw err; // Re-lanzar para que el Formulario muestre el error
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDTO) => {
    if (!token) return;
    try {
      await catalogService.update(token, id, data);
      await refreshCategories(); 
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!token) return;
    try {
      await catalogService.delete(token, id);
      // Optimistic update: eliminar de la lista local sin recargar todo
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      // Invertir estado (si era true, llamar a deactivate)
      const updatedCat = await catalogService.toggleStatus(token, id, !currentStatus);
      
      // Actualización local optimista o reemplazo
      setCategories(prev => prev.map(c => c._id === id ? updatedCat : c));
    } catch (err) {
      throw err;
    }
  };

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      meta, 
      loading, 
      error,
      refreshCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryStatus
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategoriesContext debe usarse dentro de CategoriesProvider");
  return context;
};