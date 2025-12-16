import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../ui/select";
import { User, UserFormData, ValidationErrors, mapRoleFromBackend } from "./types";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onSave: (data: UserFormData, id: string | null) => Promise<boolean>;
  validateField: (field: keyof UserFormData, value: string, isEditing: boolean) => string;
  validateForm: (data: UserFormData, isEditing: boolean) => ValidationErrors;
}

export function UserFormDialog({
  isOpen,
  onClose,
  userToEdit,
  onSave,
  validateField,
  validateForm
}: UserFormDialogProps) {

  const initialData: UserFormData = {
    nombre: "",
    apellido: "",
    email: "",
    role: "manager",
    password: "",
    isActive: true,
    cedula: "",
  };

  const [formData, setFormData] = useState<UserFormData>(initialData);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          nombre: userToEdit.nombre,
          apellido: userToEdit.apellido,
          email: userToEdit.email,
          role: mapRoleFromBackend(userToEdit.role) || "stylist",
          password: "",
          isActive: !!userToEdit.isActive,
          cedula: userToEdit.cedula ?? "",
        });
      } else {
        setFormData(initialData);
      }
      setFormErrors({});
    }
  }, [isOpen, userToEdit]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value, !!userToEdit);
    setFormErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formData, !!userToEdit);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Corrige los errores del formulario");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData, userToEdit ? userToEdit._id : null);
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">
            {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {userToEdit ? "Modifica los datos del usuario" : "Rellena los datos para crear un usuario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nombre</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
                className="bg-black border-gray-700 text-white"
              />
              {formErrors.nombre && <p className="text-red-400 text-sm">{formErrors.nombre}</p>}
            </div>
            <div>
              <Label className="text-gray-300">Apellido</Label>
              <Input
                value={formData.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                required
                className="bg-black border-gray-700 text-white"
              />
              {formErrors.apellido && <p className="text-red-400 text-sm">{formErrors.apellido}</p>}
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              className="bg-black border-gray-700 text-white"
            />
            {formErrors.email && <p className="text-red-400 text-sm">{formErrors.email}</p>}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-gray-300">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => handleChange("role", v)}
                disabled={!userToEdit} // Solo cambiar rol al editar si es requerido
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {!userToEdit ? (
                    <SelectItem value="manager">Gerente</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="stylist">Estilista</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {!userToEdit && (
              <div className="flex-1">
                <Label className="text-gray-300">Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  className="bg-black border-gray-700 text-white"
                />
                {formErrors.password && <p className="text-red-400 text-sm">{formErrors.password}</p>}
              </div>
            )}
          </div>

          <div>
            <Label className="text-gray-300">Cédula</Label>
            <Input
              value={formData.cedula}
              onChange={(e) => handleChange("cedula", e.target.value.replace(/\D/g, ""))}
              required
              className="bg-black border-gray-700 text-white"
              maxLength={10}
            />
            {formErrors.cedula && <p className="text-red-400 text-sm">{formErrors.cedula}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="rounded bg-black border-gray-700"
            />
            <Label htmlFor="active" className="text-gray-300">Activo</Label>
          </div>
          <DialogFooter className="flex gap-2">
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
              Guardar
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}