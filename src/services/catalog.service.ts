import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import { Category, CategoryListResponse, CreateCategoryDTO, UpdateCategoryDTO } from "../contexts/data/types";

const headersJson = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const catalogService = {
  getAll: async (token: string, page = 1, search = ""): Promise<CategoryListResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: "20", includeServices: "true" });
    if (search) params.append("q", search);

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.catalog.list}?${params}`, {
      headers: headersJson(token),
    });
    if (!res.ok) throw new Error("Error obteniendo categorías");
    return await res.json();
  },

  getById: async (token: string, id: string): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.catalog.detail(id)}`, {
      headers: headersJson(token),
    });
    if (!res.ok) throw new Error("Error obteniendo categoría");
    return await res.json();
  },

  create: async (token: string, data: CreateCategoryDTO): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.catalog.create}`, {
      method: "POST",
      headers: headersJson(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error creando categoría");
    }
    return await res.json();
  },

  update: async (token: string, id: string, data: UpdateCategoryDTO): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.catalog.detail(id)}`, {
      method: "PUT",
      headers: headersJson(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error actualizando categoría");
    return await res.json();
  },

  delete: async (token: string, id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.catalog.detail(id)}`, {
      method: "DELETE",
      headers: headersJson(token),
    });
    return res.ok;
  },

  toggleStatus: async (token: string, id: string, active: boolean): Promise<Category> => {
    const url = active 
      ? API_ENDPOINTS.catalog.activate(id) 
      : API_ENDPOINTS.catalog.deactivate(id);
      
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: "PATCH",
      headers: headersJson(token),
    });
    if (!res.ok) throw new Error("Error cambiando estado");
    const json = await res.json();
    return json.category;
  }
};