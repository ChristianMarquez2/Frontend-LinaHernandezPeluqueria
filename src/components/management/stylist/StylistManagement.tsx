import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
// import { useData } from '../../../contexts/data/index'; // Ya no usamos services de aquí
import { API_BASE_URL } from '../../../config/api';

import { useStylistLogic } from './useStylistLogic';
import { StylistTable } from './StylistTable';
import { StylistFormDialog, CatalogOption } from './StylistFormDialog';
import { Stylist } from './types';
import { UserFormDialog } from '../users/UserFormDialog';
import type { User as EditUser } from '../users/types';
import { updateUserProfile } from '../../../services/userService';

export function StylistManagement() {
  const { 
    stylists, 
    handleSaveStylist, 
    handleDeleteStylist,
    validateField,
    validateForm,
    refreshStylists,
  } = useStylistLogic();
  
  // Estado local para Catálogos (Necesario para el dropdown)
  const [catalogs, setCatalogs] = useState<CatalogOption[]>([]);

  // Estado Local UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUser | null>(null);

  // 🔄 Fetch de Catálogos al montar
  useEffect(() => {
    const fetchCatalogs = async () => {
        const token = localStorage.getItem('accessToken');
        if(!token) return;
        try {
            // Asumimos que la ruta es /catalogs o /categories. 
            // Basado en tu backend controller (CategoryModel), suele ser /categories
            const res = await fetch(`${API_BASE_URL}/catalog`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                // Aseguramos formato array
                setCatalogs(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (error) {
            console.error("Error cargando catálogos", error);
        }
    };
    fetchCatalogs();
  }, []);

  // Filtro
  const filteredStylists = stylists.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers UI
  const handleCreate = () => {
    setEditingStylist(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setIsDialogOpen(true);
  };

  const handleEditUser = (stylist: Stylist) => {
    const user: EditUser = {
      _id: stylist._id,
      nombre: stylist.nombre,
      apellido: stylist.apellido,
      email: stylist.email,
      role: 'stylist' as any,
      isActive: stylist.isActive,
      cedula: stylist.cedula,
      telefono: stylist.telefono,
      genero: stylist.genero as any,
      edad: (stylist as any).edad,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de desactivar este estilista?')) {
      await handleDeleteStylist(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[#D4AF37] text-xl font-semibold">Gestión de Estilistas</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Estilista
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar estilista por nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StylistTable 
            stylists={filteredStylists}
            onEdit={handleEdit}
            onEditUser={handleEditUser}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <StylistFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        stylistToEdit={editingStylist}
        
        // 👇 Pasamos los catálogos cargados
        availableCatalogs={catalogs}
        
        onSave={handleSaveStylist}
        validateField={validateField}
        validateForm={validateForm}
      />

      {/* Dialogo para editar el perfil del usuario (estilista) */}
      <UserFormDialog
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        userToEdit={editingUser}
        onSave={async (data, id) => {
          if (!id) return false;
          const token = localStorage.getItem('accessToken') || '';
          try {
            await updateUserProfile(id, {
              nombre: data.nombre,
              apellido: data.apellido,
              cedula: data.cedula,
              telefono: data.telefono,
              genero: data.genero,
              edad: data.edad ? Number(data.edad) : undefined,
              password: data.password || undefined,
            }, token);
            // Refrescar la lista automáticamente tras guardar
            await refreshStylists();
            return true;
          } catch (err) {
            return false;
          }
        }}
        validateField={(field, value, isEditing) => {
          // Validación básica: reusar reglas mínimas
          if (["nombre","apellido","cedula"].includes(field) && !value) return "Requerido";
          if (field === "cedula" && value && !/^\d{10}$/.test(value)) return "Cédula inválida";
          if (field === "telefono") {
            if (!value) return "Requerido";
            if (!/^\d{10}$/.test(value)) return "Teléfono debe tener 10 dígitos";
          }
          if (field === "genero" && !value) return "Seleccione un género";
          return "";
        }}
        validateForm={(formData, isEditing) => {
          const errors: any = {};
          if (!formData.nombre) errors.nombre = "Requerido";
          if (!formData.apellido) errors.apellido = "Requerido";
          if (!formData.cedula || !/^\d{10}$/.test(formData.cedula)) errors.cedula = "Cédula inválida";
          if (!formData.telefono || !/^\d{10}$/.test(formData.telefono)) errors.telefono = "Teléfono debe tener 10 dígitos";
          if (!formData.genero) errors.genero = "Seleccione un género";
          return errors;
        }}
      />
    </div>
  );
}