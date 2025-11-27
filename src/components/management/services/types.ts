import { Category as GlobalCategory } from "../../../contexts/data/types";

export interface Service {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
  categoria?: string; // ID de la categoría
}

// Reutilizamos la definición global o la local compatible
export type Category = GlobalCategory;

export interface ServiceFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: string; // String para inputs
  duracionMin: string; // String para inputs
  activo: boolean;
  categoria: string;
}