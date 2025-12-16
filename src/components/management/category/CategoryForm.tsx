import React, { useState, useEffect } from "react";
import { CreateCategoryDTO, Category } from "../../../contexts/data/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";

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
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        nombre,
        descripcion,
        imageUrl,
        services: initialData?.services?.map((s: any) =>
          typeof s === "string" ? s : s._id
        ) || [],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">
            {initialData ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete los datos de la categoría para el catálogo de servicios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <p className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-300 text-sm">
              {error}
            </p>
          )}

          {/* NOMBRE */}
          <div>
            <Label className="text-gray-300">Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="bg-black border-gray-700 text-white mt-1.5"
              placeholder="Ej. Corte de Cabello"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <Label className="text-gray-300">Descripción</Label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white mt-1.5 h-24 resize-none focus:border-[#D4AF37] outline-none"
              placeholder="Breve descripción..."
            />
          </div>

          {/* IMAGEN */}
          <div>
            <Label className="text-gray-300">URL de Imagen (Opcional)</Label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="bg-black border-gray-700 text-white mt-1.5"
              placeholder="Función no disponible de momento"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-red"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>


        </form>
      </DialogContent>
    </Dialog>
  );
}
