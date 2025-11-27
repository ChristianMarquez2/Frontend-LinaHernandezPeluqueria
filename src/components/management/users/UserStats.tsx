import { Shield, UserCog, Scissors, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { User, mapRoleFromBackend } from "./types";

interface UserStatsProps {
  users: User[];
}

export function UserStats({ users }: UserStatsProps) {
  const countByRole = {
    admin: users.filter((u) => mapRoleFromBackend(u.role) === "admin").length,
    manager: users.filter((u) => mapRoleFromBackend(u.role) === "manager").length,
    stylist: users.filter((u) => mapRoleFromBackend(u.role) === "stylist").length,
    client: users.filter((u) => mapRoleFromBackend(u.role) === "client").length,
  };

  const stats = [
    { id: "admin", label: "Administradores", icon: <Shield className="h-8 w-8 text-red-400" />, count: countByRole.admin },
    { id: "manager", label: "Gerentes", icon: <UserCog className="h-8 w-8 text-blue-400" />, count: countByRole.manager },
    { id: "stylist", label: "Estilistas", icon: <Scissors className="h-8 w-8 text-purple-400" />, count: countByRole.stylist },
    { id: "client", label: "Clientes", icon: <UserIcon className="h-8 w-8 text-green-400" />, count: countByRole.client },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((r) => (
        <Card key={r.id} className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {r.icon}
              <div>
                <p className="text-sm text-gray-400">{r.label}</p>
                <p className="text-[#D4AF37]">{r.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}