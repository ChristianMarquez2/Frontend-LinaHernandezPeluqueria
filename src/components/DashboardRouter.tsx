import { useAuth } from "../contexts/auth/index";
import { AdminDashboard } from "./dashboards/AdminDashboard"; // Asegúrate de que esta carpeta exista
import { ManagerDashboard } from "./dashboards/ManagerDashboard"; // Si existe
import { StylistDashboard } from "./dashboards/StylistDashboard"; // Si existe
import { ClientDashboard } from "../components/dashboards/ClientDashboard/index"; // 🔥 CORREGIDO: Apunta a la carpeta 'ClienteDashboard' que creamos

export function DashboardRouter() {
  const { user } = useAuth();

  // 1. Loading State: Evita la pantalla blanca mientras carga el usuario
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin h-8 w-8 border-4 border-[#9D8EC1] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 2. Normalización: Backend suele enviar MAYÚSCULAS, pero aseguramos compatibilidad
  const role = (user.role || "").toString().toUpperCase();

  // 3. Routing
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    
    case "MANAGER":
    case "GERENTE":
      return ManagerDashboard ? <ManagerDashboard /> : <div className="text-white p-10">Panel Gerente en construcción</div>;
    
    case "STYLIST":
    case "ESTILISTA":
      return StylistDashboard ? <StylistDashboard /> : <div className="text-white p-10">Panel Estilista en construcción</div>;
    
    case "CLIENT":
    case "CLIENTE":
      return <ClientDashboard />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Acceso Denegado</h2>
          <p>Tu usuario tiene un rol no reconocido: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{user.role}</span></p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            Recargar
          </button>
        </div>
      );
  }
}