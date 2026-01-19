import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { ServiceTable } from "./ServiceTable";
import { ServiceFormDialog } from "./ServiceFormDialog";
import { useServiceLogic } from "./useServiceLogic";
import { Service } from "../../../contexts/data/types";;

export function ServiceManagement() {
  const {
    services,
    categories,
    loading,
    handleSaveService,
    handleDeleteService,
    getCategoryName
  } = useServiceLogic();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // 🔥 MEJORA DE FILTRADO: 
  // 1. Manejo de 'categoria' como string o como objeto (el backend a veces lo popula).
  // 2. Fallback para 'codigo' opcional.
  const filteredServices = services.filter((s) => {
    const search = searchTerm.toLowerCase();
    
    // Extraemos el ID de la categoría independientemente de si viene como objeto o ID string
    const categoryId = typeof s.categoria === 'object' ? (s.categoria as any)?._id : s.categoria;
    const categoryName = getCategoryName(categoryId || "");

    return (
      s.nombre.toLowerCase().includes(search) ||
      (s.codigo || "").toLowerCase().includes(search) ||
      categoryName.toLowerCase().includes(search)
    );
  });

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      await handleDeleteService(serviceToDelete);
      setServiceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#D4AF37] text-2xl font-semibold">Gestión de Servicios</h2>
          <p className="text-gray-400 text-sm">Administra el catálogo de servicios ofrecidos</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 font-medium text-white transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-gray-700 text-white focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Si el backend devolvió una lista vacía, mostramos un mensaje amigable */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No se encontraron servicios que coincidan con la búsqueda.
            </div>
          ) : (
            <ServiceTable
              services={filteredServices}
              getCategoryName={getCategoryName}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        serviceToEdit={editingService}
        categories={categories}
        existingServices={services}
        onSave={handleSaveService}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar Servicio"
        description="¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}