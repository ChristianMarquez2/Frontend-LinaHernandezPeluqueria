// src/components/management/category/CategoryForm.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateCategoryDTO, Category } from "../../../contexts/data/types";

interface Props {
  initialData?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDTO) => Promise<void>;
}

export function CategoryForm({ initialData, isOpen, onClose, onSubmit }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear o rellenar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNombre(initialData.nombre);
        setDescripcion(initialData.descripcion || "");
        setImageUrl(initialData.imageUrl || "");
      } else {
        setNombre("");
        setDescripcion("");
        setImageUrl("");
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        nombre,
        descripcion,
        imageUrl,
        // Nota: Si necesitas gestionar servicios aquí, necesitarás un selector múltiple.
        // Por ahora mantenemos los servicios existentes si es edición, o vacíos si es nuevo.
        services: initialData?.services.map((s: any) => typeof s === 'string' ? s : s._id) || []
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
              placeholder="Ej. Corte de Cabello"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none h-24 resize-none"
              placeholder="Breve descripción..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">URL de Imagen (Opcional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#b5952f] transition disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}