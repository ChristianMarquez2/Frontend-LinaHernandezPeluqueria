import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

// Importamos tipos globales y locales
import { Stylist, StylistFormData, ValidationErrors } from './types';

// Interfaz para el dropdown
export interface CatalogOption {
  _id: string;
  nombre: string;
}

interface StylistFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stylistToEdit: Stylist | null;
  // 👇 CAMBIO: Recibimos Catálogos para el dropdown
  availableCatalogs: CatalogOption[];
  onSave: (data: StylistFormData, id: string | null) => Promise<boolean>;
  validateField: (name: keyof StylistFormData, value: string, isEditing: boolean) => string | null;
  validateForm: (data: StylistFormData, isEditing: boolean) => ValidationErrors;
}

export function StylistFormDialog({
  isOpen,
  onClose,
  stylistToEdit,
  availableCatalogs,
  onSave,
  validateField,
  validateForm
}: StylistFormDialogProps) {

  const initialData: StylistFormData = {
    firstName: '',
    lastName: '',
    cedula: '',
    phone: '',
    gender: '' as any,
    catalog: '', // Ahora guardamos el ID del catálogo
    email: '',
    password: '',
  };

  const [formData, setFormData] = useState<StylistFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (stylistToEdit) {
        // Lógica para extraer el ID del primer catálogo asignado
        let mainCatalogId = '';

        // Verificamos si tiene catálogos asignados
        if (stylistToEdit.catalogs && stylistToEdit.catalogs.length > 0) {
          const firstCat = stylistToEdit.catalogs[0];
          // Manejo seguro si es objeto populated o string ID
          mainCatalogId = typeof firstCat === 'string' ? firstCat : firstCat._id;
        }

        setFormData({
          firstName: stylistToEdit.nombre,
          lastName: stylistToEdit.apellido,
          cedula: stylistToEdit.cedula || '',
          phone: stylistToEdit.telefono || '',
          gender: (stylistToEdit.genero as any) || '',
          catalog: mainCatalogId,
          email: stylistToEdit.email,
          password: '',
        });
      } else {
        setFormData(initialData);
      }
      setValidationErrors({});
    }
  }, [isOpen, stylistToEdit]);

  const handleInputChange = (field: keyof StylistFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value, !!stylistToEdit);
    setValidationErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formData, !!stylistToEdit);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData, stylistToEdit ? stylistToEdit._id : null);
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">
            {stylistToEdit ? 'Editar Estilista' : 'Nuevo Estilista'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete los datos del estilista y asigne un catálogo de servicios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* NOMBRE */}
            <div>
              <Label htmlFor="firstName" className="text-gray-300">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className="bg-black border-gray-700 text-white mt-1.5"
                maxLength={20}
              />
              {validationErrors.firstName && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
              )}
            </div>
            {/* APELLIDO */}
            <div>
              <Label htmlFor="lastName" className="text-gray-300">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className="bg-black border-gray-700 text-white mt-1.5"
                maxLength={20}
              />
              {validationErrors.lastName && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CÉDULA */}
            <div>
              <Label htmlFor="cedula" className="text-gray-300">Cédula *</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => handleInputChange('cedula', e.target.value.replace(/\D/g, ''))}
                required
                className="bg-black border-gray-700 text-white mt-1.5"
                maxLength={10}
                placeholder="10 dígitos"
              />
              {validationErrors.cedula && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.cedula}</p>
              )}
            </div>

            {/* TELÉFONO */}
            <div>
              <Label htmlFor="phone" className="text-gray-300">Celular *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                required
                className="bg-black border-gray-700 text-white mt-1.5"
                maxLength={10}
                placeholder="09..."
              />
              {validationErrors.phone && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* GÉNERO */}
            <div>
              <Label htmlFor="gender" className="text-gray-300">Género *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: any) => handleInputChange('gender', value)}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white mt-1.5">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="O">Otro</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.gender}</p>
              )}
            </div>

            {/* CATÁLOGO (CORREGIDO: Ya no es servicio) */}
            <div>
              <Label htmlFor="catalog" className="text-gray-300">Catálogo Asignado *</Label>
              <Select
                value={formData.catalog}
                onValueChange={(value) => handleInputChange('catalog', value)}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white mt-1.5">
                  <SelectValue placeholder="Seleccione catálogo..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-60">
                  {availableCatalogs.length === 0 ? (
                    <SelectItem value="empty" disabled>Cargando catálogos...</SelectItem>
                  ) : (
                    availableCatalogs.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {validationErrors.catalog && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.catalog}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <Label htmlFor="email" className="text-gray-300">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-black border-gray-700 text-white mt-1.5"
              placeholder="nombre@ejemplo.com"
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div>
            <Label htmlFor="password" className="text-gray-300">
              {stylistToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required={!stylistToEdit}
              className="bg-black border-gray-700 text-white mt-1.5"
              placeholder={stylistToEdit ? "Dejar en blanco para mantener actual" : "Mínimo 8 caracteres"}
            />
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
            {!validationErrors.password && !stylistToEdit && (
              <p className="text-gray-500 text-[10px] mt-1">
                Requiere: 8+ caracteres, mayúscula, minúscula, número y símbolo.
              </p>
            )}
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
              {isSubmitting
                ? "Procesando..."
                : stylistToEdit
                  ? "Actualizar"
                  : "Crear Estilista"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}