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
import { Service, Category, ServiceFormData } from "./types";

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: Service | null; // Si es null, es modo creación
  categories: Category[];
  existingServices: Service[]; // Necesario para generar código
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

  // Estado Inicial
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

  // Cargar datos al abrir
  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setFormData({
          nombre: serviceToEdit.nombre,
          codigo: serviceToEdit.codigo,
          descripcion: serviceToEdit.descripcion || "",
          precio: serviceToEdit.precio.toString(),
          duracionMin: serviceToEdit.duracionMin.toString(),
          activo: serviceToEdit.activo,
          categoria: serviceToEdit.categoria || "",
        });
      } else {
        setFormData(initialFormState);
      }
      setFormErrors({});
    }
  }, [isOpen, serviceToEdit]);

  // VALIDACIONES
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{1,20}$/;

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "nombre":
        if (!value || !value.trim()) return "Requerido";
        if (!nameRegex.test(value)) return "Solo letras y espacios, máx 20 caracteres";
        return "";
      case "precio": {
        if (!value && value !== "0") return "Requerido";
        const n = parseFloat(value);
        if (Number.isNaN(n) || n <= 0) return "Debe ser un número positivo";
        return "";
      }
      case "duracionMin": {
        if (!value && value !== "0") return "Requerido";
        const n = parseInt(value, 10);
        if (Number.isNaN(n) || n <= 4) return "Debe ser mayor a 4 minutos";
        return "";
      }
      case "descripcion": {
        if (!value) return "";
        const words = value.trim().split(/\s+/).filter(Boolean);
        if (words.length > 50) return "Máximo 50 palabras";
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: err || "" }));
  };

  // GENERAR CÓDIGO AUTOMÁTICO
  useEffect(() => {
    // Solo generar si es nuevo registro, tenemos categoría y nombre, y no estamos editando código manualmente
    if (!serviceToEdit && formData.categoria && formData.nombre) {
      const category = categories.find(cat => cat._id === formData.categoria);
      if (category) {
        const categoryInitial = category.nombre.charAt(0).toUpperCase();
        const serviceInitial = formData.nombre.charAt(0).toUpperCase();

        // Lógica de conteo
        const existingCodes = existingServices
          .filter(s => s.codigo && s.codigo.startsWith(categoryInitial + serviceInitial))
          .map(s => {
            const match = s.codigo.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          });

        const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
        const newCode = `${categoryInitial}${serviceInitial}${nextNumber.toString().padStart(3, '0')}`;

        setFormData(prev => ({ ...prev, codigo: newCode }));
      }
    }
  }, [formData.categoria, formData.nombre, categories, existingServices, serviceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todo antes de enviar
    const fieldsToValidate = ["nombre", "precio", "duracionMin", "descripcion"];
    const newErrors: any = {};
    let hasError = false;

    fieldsToValidate.forEach((f) => {
      const val = (formData as any)[f] ?? "";
      const err = validateField(f, val);
      if (err) {
        newErrors[f] = err;
        hasError = true;
      }
    });

    setFormErrors(newErrors);
    if (hasError) {
      toast.error("Corrige los errores del formulario");
      return;
    }

    if (!formData.categoria) {
      toast.error("Selecciona una categoría");
      return;
    }

    if (!formData.codigo) {
      toast.error("Error en generación de código");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData, serviceToEdit ? serviceToEdit._id : null);
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">
            {serviceToEdit ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Completa los datos del servicio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CATEGORÍA */}
          <div>
            <Label htmlFor="categoria" className="text-gray-300">Categoría *</Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9D8EC1] mt-1"
            >
              <option value="">Seleccionar categoría</option>
              {categories.filter(cat => cat.activo).map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                No hay categorías activas. Crea una primero.
              </p>
            )}
          </div>

          {/* NOMBRE */}
          <div>
            <Label htmlFor="nombre" className="text-gray-300">Nombre del Servicio *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className="bg-black border-gray-700 text-white mt-1"
              placeholder="Ej: Corte Urbano"
            />
            {formErrors.nombre && <p className="text-red-400 text-sm mt-1">{formErrors.nombre}</p>}
          </div>

          {/* CÓDIGO */}
          <div>
            <Label htmlFor="codigo" className="text-gray-300">Código (Auto)</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              readOnly
              className="bg-gray-800 border-gray-700 text-gray-300 font-mono mt-1"
              placeholder="Se generará automáticamente"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <Label htmlFor="descripcion" className="text-gray-300">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              className="bg-black border-gray-700 text-white mt-1"
              rows={3}
              placeholder="Opcional..."
            />
            {formErrors.descripcion && <p className="text-red-400 text-sm mt-1">{formErrors.descripcion}</p>}
          </div>

          {/* PRECIO Y DURACIÓN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio" className="text-gray-300">Precio *</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleChange("precio", e.target.value)}
                className="bg-black border-gray-700 text-white mt-1"
              />
              {formErrors.precio && <p className="text-red-400 text-sm mt-1">{formErrors.precio}</p>}
            </div>
            <div>
              <Label htmlFor="duracionMin" className="text-gray-300">Duración (min) *</Label>
              <Input
                id="duracionMin"
                type="number"
                min="1"
                value={formData.duracionMin}
                onChange={(e) => handleChange("duracionMin", e.target.value)}
                className="bg-black border-gray-700 text-white mt-1"
              />
              {formErrors.duracionMin && <p className="text-red-400 text-sm mt-1">{formErrors.duracionMin}</p>}
            </div>
          </div>

          {/* ACTIVO */}
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange("activo", checked)}
              className="data-[state=checked]:bg-[#9D8EC1]"
            />
            <Label className="text-gray-300">Servicio activo</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={onClose}
              className="bg-red-400 hover:bg-red-500 text-white font-medium transition"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : (serviceToEdit ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}