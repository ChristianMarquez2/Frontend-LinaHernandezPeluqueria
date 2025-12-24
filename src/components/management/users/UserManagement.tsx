import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/auth/index";

import { useUserLogic } from "./useUserLogic";
import { UserStats } from "./UserStats";
import { UserTable } from "./UserTable";
import { UserFormDialog } from "./UserFormDialog";
import { User, mapRoleFromBackend } from "./types";

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { 
    users, 
    handleSaveUser, 
    handleToggleStatus, 
    validateField, 
    validateForm 
  } = useUserLogic();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "manager" | "stylist" | "client">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 🔍 Filtrado
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (u.nombre || "").toLowerCase().includes(search) ||
      (u.apellido || "").toLowerCase().includes(search) ||
      (u.email || "").toLowerCase().includes(search);

    const matchRole =
      roleFilter === "all" ||
      mapRoleFromBackend(u.role) === roleFilter;

    return matchSearch && matchRole;
  });

  // Handlers
  const handleCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[#D4AF37] text-2xl font-semibold">Gestión de Usuarios</h2>

      {/* Estadísticas */}
      <UserStats users={users} />

      {/* Panel Principal */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white"
              />
            </div>

            {/* Controles de Filtro y Creación */}
            <div className="flex flex-wrap gap-2 items-center">
              {mapRoleFromBackend(currentUser?.role) === "admin" && (
                <Button onClick={handleCreate} className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90">
                  Nuevo Gerente
                </Button>
              )}
              
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {["all", "admin", "manager", "stylist", "client"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      roleFilter === role
                        ? "bg-[#9D8EC1] text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {role === "all"
                      ? "Todos"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <UserTable 
            users={filteredUsers}
            currentUserRole={mapRoleFromBackend(currentUser?.role)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <UserFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userToEdit={editingUser}
        onSave={handleSaveUser}
        validateField={validateField}
        validateForm={validateForm}
      />
    </div>
  );
}