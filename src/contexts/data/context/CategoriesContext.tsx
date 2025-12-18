import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index"; // Ajustado a tu ruta de Auth
import { dataService } from "../service"; // Usamos el dataService central
import { Category, PaginationMeta, CreateCategoryDTO, UpdateCategoryDTO } from "../types";

interface CategoriesContextType {
  categories: Category[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
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
      const response = await dataService.fetchCategories(token, page, search);
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

  useEffect(() => {
    if (user && token) refreshCategories();
  }, [user, token, refreshCategories]);

  // --- ACCIONES DE ESCRITURA ---
  const createCategory = async (data: CreateCategoryDTO) => {
    if (!token) return;
    try {
      await dataService.saveCategory(token, data);
      await refreshCategories();
    } catch (err: any) {
      throw err;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDTO) => {
    if (!token) return;
    try {
      // Limpieza de campos undefined para cumplir con el esquema del backend
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await dataService.saveCategory(token, payload, id);
      await refreshCategories();
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!token) return;
    try {
      await dataService.deleteCategory(token, id);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      const updatedCat = await dataService.toggleCategoryStatus(token, id, !currentStatus);
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