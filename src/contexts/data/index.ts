// 1. El Provider Principal (Reemplaza al antiguo Provider)
export { DataProvider } from "./DataProvider";

// 2. El Hook de Compatibilidad (Para que tu código actual siga funcionando)
export { useData } from "./useData";

// 3. Los Hooks Segmentados (Para usar en componentes nuevos y optimizar rendimiento)
export { useServices } from "../data/context/ServicesContext";
export { useAppointments } from "../data/context/AppointmentsContext";
export { useRatings } from "../data/context/RatingsContext";
export { useNotifications } from "../data/context/NotificationsContext";
export { useReports } from "../data/context/ReportsContext";

// 4. Tipos y Utilidades (Igual que antes)
export * from "./types";
export * from "./utils";

// Opcional: si usas el servicio directamente en otros lados
export { dataService } from "./service";