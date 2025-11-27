import { Shield, UserCog, Scissors, User as UserIcon, Pencil, Trash2, Check } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { User, mapRoleFromBackend } from "./types";

interface UserTableProps {
  users: User[];
  currentUserRole?: string; // Para saber si puede editar (admin)
  onEdit: (user: User) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function UserTable({ users, currentUserRole, onEdit, onToggleStatus }: UserTableProps) {
  
  // Helpers visuales internos
  const roleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4 text-red-400" />;
      case "manager": return <UserCog className="h-4 w-4 text-blue-400" />;
      case "stylist": return <Scissors className="h-4 w-4 text-purple-400" />;
      default: return <UserIcon className="h-4 w-4 text-green-400" />;
    }
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-red-900 text-red-200">Admin</Badge>;
      case "manager": return <Badge className="bg-blue-900 text-blue-200">Gerente</Badge>;
      case "stylist": return <Badge className="bg-purple-900 text-purple-200">Estilista</Badge>;
      default: return <Badge className="bg-green-900 text-green-200">Cliente</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-400">Nombre</TableHead>
          <TableHead className="text-gray-400">Email</TableHead>
          <TableHead className="text-gray-400">Rol</TableHead>
          <TableHead className="text-gray-400">Activo</TableHead>
          <TableHead className="text-gray-400">Creado</TableHead>
          <TableHead className="text-gray-400">Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((u) => {
          const uiRole = mapRoleFromBackend(u.role);
          return (
            <TableRow key={u._id} className="border-gray-800">
              <TableCell className="text-white flex items-center gap-2">
                {roleIcon(uiRole)} {u.nombre} {u.apellido}
              </TableCell>

              <TableCell className="text-gray-300">{u.email}</TableCell>

              <TableCell>{roleBadge(uiRole)}</TableCell>

              <TableCell>
                <Badge
                  className={
                    u.isActive
                      ? "bg-green-900 text-green-200"
                      : "bg-red-900 text-red-200"
                  }
                >
                  {u.isActive ? "Sí" : "No"}
                </Badge>
              </TableCell>

              <TableCell className="text-gray-400">
                {new Date(u.createdAt).toLocaleDateString("es-ES")}
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  {currentUserRole === "admin" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-[#D4AF37] hover:bg-gray-800"
                      onClick={() => onEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {u.isActive ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:bg-gray-800"
                      onClick={() => onToggleStatus(u._id, true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-green-400 hover:bg-gray-800"
                      onClick={() => onToggleStatus(u._id, false)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}