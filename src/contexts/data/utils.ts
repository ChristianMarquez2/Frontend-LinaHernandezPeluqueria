import { Service } from "./types";

// Normalizador de servicesOffered (string | objeto)
// Asegura que siempre tengamos un array de objetos Service
export const normalizeServicesOffered = (list: Array<string | Service>): Service[] => {
  return list.map((item) => {
    if (typeof item === "string") {
      // Si el backend devuelve solo IDs, creamos un objeto placeholder
      // Idealmente el backend debería hacer .populate()
      return {
        _id: item,
        nombre: "Cargando...",
        descripcion: "",
        precio: 0,
        duracionMin: 0,
        activo: true,
      };
    }
    return item;
  });
};