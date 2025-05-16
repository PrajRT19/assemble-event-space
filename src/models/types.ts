
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl: string;
  capacity: number;
  price: number;
  categoryId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  numberOfTickets: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'booking' | 'cancellation' | 'update';
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
