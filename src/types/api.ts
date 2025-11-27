export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'manager' | 'stylist' | 'client';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutos
  category?: string;
  active: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  stylistId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
