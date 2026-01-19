// src/components/management/category/CategoryManagement.tsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCategoriesContext } from "../../../contexts/data/context/CategoriesContext"; // Ajusta ruta
import { Category, CreateCategoryDTO } from "../../../contexts/data/types";
import { CategoryList } from "./CategoryList";
import { CategoryFilters } from "./CategoryFilters";
import { CategoryForm } from "./CategoryForm";
import { ConfirmDialog } from "../../ui/confirm-dialog";

export function CategoryManagement() {
  const {
    categories,
    meta,
    loading,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
  } = useCategoriesContext();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Debounce simple para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshCategories(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, refreshCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreateCategoryDTO) => {
    if (editingCategory) {
      await updateCategory(editingCategory._id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setCategoryToDelete(null);
      } catch (err) {
        alert("Error eliminando categoría");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header de la página */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Categorías</h1>
          <p className="text-gray-400">Administra el catálogo de servicios</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-white font-medium rounded-lg transition"
        >
          <Plus size={20} className="mr-1" />
          Nueva Categoría
        </button>

      </div>

      <CategoryFilters search={search} onSearchChange={setSearch} />

      {loading && categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Cargando categorías...</div>
      ) : (
        <CategoryList
          categories={categories}
          meta={meta}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleStatus={(id, status) => toggleCategoryStatus(id, status)}
          onPageChange={(page) => refreshCategories(page, search)}
        />
      )}

      {/* Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingCategory}
        onSubmit={handleSubmit}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar Categoría"
        description="¿Estás seguro de eliminar esta categoría permanentemente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}