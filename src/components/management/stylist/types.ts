// src/components/dashboard/stylist/types.ts

import { Stylist as GlobalStylist, Service } from '../../../contexts/data/types';

// Extendemos la interfaz global para asegurar que TypeScript sepa que tiene catálogos
// (Asegúrate de que tu backend esté enviando 'catalogs' en el populate de listStylists)
export interface Stylist extends GlobalStylist {
  catalogs?: { _id: string; nombre: string }[]; 
}

export interface StylistFormData {
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;
  gender: '' | 'M' | 'F' | 'O';
  catalog: string; // 👈 CAMBIO: Antes 'service', ahora 'catalog'
  email: string;
  password: string;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  cedula?: string;
  phone?: string;
  email?: string;
  password?: string;
  gender?: string;
  catalog?: string; // 👈 CAMBIO
}