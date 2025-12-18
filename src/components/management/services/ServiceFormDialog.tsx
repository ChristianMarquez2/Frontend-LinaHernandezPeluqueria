import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Switch } from "../../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Service, Category, ServiceFormData } from "../../../contexts/data/types";;

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: Service | null;
  categories: Category[];
  existingServices: Service[];
  onSave: (data: ServiceFormData, id: string | null) => Promise<boolean>;
}

export function ServiceFormDialog({
  isOpen,
  onClose,
  serviceToEdit,
  categories,
  existingServices,
  onSave,
}: ServiceFormDialogProps) {

  const initialFormState: ServiceFormData = {
    nombre: "",
    codigo: "",
    descripcion: "",
    precio: "",
    duracionMin: "",
    activo: true,
    categoria: "",
  };

  const [formData, setFormData] = useState<ServiceFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        // Manejamos si categoria viene como objeto populado o string
        const catId = typeof serviceToEdit.categoria === 'object'
          ? (serviceToEdit.categoria as any)?._id
          : serviceToEdit.categoria;

        setFormData({
          nombre: serviceToEdit.nombre,
          codigo: serviceToEdit.codigo || "",
          descripcion: serviceToEdit.descripcion || "",
          precio: serviceToEdit.precio.toString(),
          duracionMin: serviceToEdit.duracionMin.toString(),
          activo: serviceToEdit.activo,
          categoria: catId || "",
        });
      } else {
        setFormData(initialFormState);
      }
      setFormErrors({});
    }
  }, [isOpen, serviceToEdit]);

  // VALIDACIONES (Alineadas con Joi y Lógica de Negocio del Backend)
  const validateField = (field: string, value: any) => {
    switch (field) {
      case "nombre":
        if (!value || !value.trim()) return "El nombre es requerido";
        if (value.length > 50) return "Máximo 50 caracteres";
        return "";
      case "precio": {
        const n = parseFloat(value);
        if (isNaN(n) || n < 0) return "Precio inválido (mínimo 0)";
        return "";
      }
      case "duracionMin": {
        const n = parseInt(value, 10);
        if (isNaN(n) || n < 30) return "Mínimo 30 minutos";
        // 🔥 CRÍTICO: El backend requiere múltiplos de 30 para los SLOTS
        if (n % 30 !== 0) return "Debe ser múltiplo de 30 (30, 60, 90...)";
        return "";
      }
      case "categoria":
        if (!value) return "Selecciona una categoría";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: err || "" }));
  };

  // GENERAR CÓDIGO AUTOMÁTICO (Solo en creación)
  useEffect(() => {
    if (!serviceToEdit && formData.categoria && formData.nombre && formData.nombre.length >= 2) {
      const category = categories.find(cat => cat._id === formData.categoria);
      if (category) {
        const prefix = (category.nombre.substring(0, 2) + formData.nombre.substring(0, 2)).toUpperCase();

        const count = existingServices.filter(s =>
          s.codigo && s.codigo.startsWith(prefix) // 👈 Verificamos que s.codigo exista
        ).length;
        const newCode = `${prefix}${(count + 1).toString().padStart(3, '0')}`;

        setFormData(prev => ({ ...prev, codigo: newCode }));
      }
    }
  }, [formData.categoria, formData.nombre, categories, existingServices, serviceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: any = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, (formData as any)[key]);
      if (err) errors[key] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Revisa los errores en el formulario");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData, serviceToEdit ? serviceToEdit._id : null);
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
            {serviceToEdit ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Los servicios con duraciones exactas permiten una mejor generación de turnos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* CATEGORÍA */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] outline-none"
            >
              <option value="">Seleccione una categoría</option>
              {categories.filter(c => c.activo).map(cat => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>
            {formErrors.categoria && <p className="text-red-400 text-xs">{formErrors.categoria}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="bg-black border-gray-700"
                placeholder="Corte..."
              />
              {formErrors.nombre && <p className="text-red-400 text-xs">{formErrors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                readOnly
                className="bg-gray-800 border-gray-700 font-mono text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              className="bg-black border-gray-700 resize-none"
              placeholder="Detalles del servicio..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio ($) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleChange("precio", e.target.value)}
                className="bg-black border-gray-700"
              />
              {formErrors.precio && <p className="text-red-400 text-xs">{formErrors.precio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracionMin">Duración *</Label>
              <select
                id="duracionMin"
                value={formData.duracionMin}
                onChange={(e) => handleChange("duracionMin", e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 outline-none"
              >
                <option value="">Elegir...</option>
                <option value="30">30 min</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30 min</option>
                <option value="120">2 horas</option>
              </select>
              {formErrors.duracionMin && <p className="text-red-400 text-xs">{formErrors.duracionMin}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg border border-gray-800">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(val) => handleChange("activo", val)}
            />
            <Label htmlFor="activo">Disponible para el público</Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="btn-red"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
            >
              {isSubmitting ? "Guardando..." : "Confirmar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}