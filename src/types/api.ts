export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'manager' | 'stylist' | 'client';
}

export interface Service {
  _id: string; // Ojo: tu backend a veces usa _id y a veces id, asegúrate de unificar o usar _id
  id?: string;
  name: string; // Tu backend usa 'nombre' en algunos lados, confirma esto con tu DTO
  nombre?: string; 
  description: string;
  price: number;
  precio?: number;
  duration: number;
  duracionMin?: number;
  category?: string;
  active: boolean;
}

export interface Booking {
  _id: string; // Mongo ID
  id?: string;
  clientId: string | User; // Puede venir populado
  stylistId: string | User;
  serviceId: string | Service;
  date: string; // Tu backend usa 'inicio'
  inicio: string; 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  estado: string; // Mapeo directo de tu backend
  
  // ✅ NUEVOS CAMPOS DE PAGO
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  invoiceNumber?: string;
  paymentMethod?: string;
  transferProofUrl?: string;
  precio?: number;
  notas?: string;
}

// ✅ NUEVAS INTERFACES PARA PAGO
export interface BankInfo {
  bank: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  reference: string;
}

export interface TransferRequestResponse {
  message: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  bankInfo: BankInfo;
  uploadProofEndpoint: string;
}


export interface Rating {
  id: string;
  rating: number;
  comment: string;
  clientId: string;
  stylistId: string;
  serviceId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'rating' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
