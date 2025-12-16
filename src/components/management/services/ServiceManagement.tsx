import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ServiceTable } from "./ServiceTable";
import { ServiceFormDialog } from "./ServiceFormDialog";
import { useServiceLogic } from "./useServiceLogic";
import { Service } from "./types";

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

  // Filtrado mejorado (seguro contra nulos)
  const filteredServices = services.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.codigo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(s.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
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
          className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 font-medium text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>

      </div>

      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-gray-700 text-white focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
        </CardHeader>

        <CardContent>
          <ServiceTable
            services={filteredServices}
            getCategoryName={getCategoryName}
            onEdit={handleEdit}
            onDelete={handleDeleteService}
          />
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
    </div>
  );
}