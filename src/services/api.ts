
import { User, Event, Booking, Notification, Category } from "../models/types";

// Mock data
let users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Customer User",
    email: "customer@example.com",
    password: "password123",
    role: "customer",
    createdAt: new Date(),
  },
];

let categories: Category[] = [
  { id: "1", name: "Conference", description: "Professional gatherings and conferences" },
  { id: "2", name: "Workshop", description: "Hands-on learning experiences" },
  { id: "3", name: "Social", description: "Networking and social events" },
  { id: "4", name: "Concert", description: "Music and entertainment events" },
  { id: "5", name: "Festival", description: "Cultural and celebratory events" },
  { id: "6", name: "Exhibition", description: "Art and product exhibitions" },
];

let events: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2025",
    description: "Join us for the biggest tech conference of the year featuring the latest innovations and industry experts.",
    date: new Date(2025, 5, 15),
    location: "Convention Center, New Delhi",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000",
    capacity: 500,
    price: 12999.99,
    categoryId: "1",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Design Workshop",
    description: "A hands-on workshop exploring the latest design trends and techniques with industry professionals.",
    date: new Date(2025, 6, 10),
    location: "Design Hub, Mumbai",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000",
    capacity: 50,
    price: 5999.99,
    categoryId: "2",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Networking Mixer",
    description: "Connect with professionals in your industry in this casual networking event with drinks and appetizers.",
    date: new Date(2025, 7, 5),
    location: "Skyline Lounge, Bangalore",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-432f7b1e1760?q=80&w=1000",
    capacity: 100,
    price: 2999.99,
    categoryId: "3",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Annual Music Festival",
    description: "Experience three days of live music from top artists across multiple stages in a beautiful outdoor setting.",
    date: new Date(2025, 8, 20),
    location: "Riverfront Park, Chennai",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1000",
    capacity: 2000,
    price: 3999.99,
    categoryId: "4",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Cultural Dance Festival",
    description: "Celebrate the rich cultural heritage through traditional dance performances from across India.",
    date: new Date(2025, 9, 12),
    location: "Heritage Center, Jaipur",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000",
    capacity: 800,
    price: 1499.99,
    categoryId: "5",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to a panel of investors, with a chance to win funding.",
    date: new Date(2025, 7, 25),
    location: "Innovation Hub, Hyderabad",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000",
    capacity: 200,
    price: 499.99,
    categoryId: "1",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    title: "Photography Exhibition",
    description: "Explore stunning photography from both established and emerging photographers from around the country.",
    date: new Date(2025, 10, 5),
    location: "Art Gallery, Kolkata",
    imageUrl: "https://images.unsplash.com/photo-1572953900290-2e5874fc0622?q=80&w=1000",
    capacity: 300,
    price: 799.99,
    categoryId: "6",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let bookings: Booking[] = [];
let notifications: Notification[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    await delay(800);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    // Don't send password to front end
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword };
  },
  register: async (name: string, email: string, password: string, role: 'customer' = 'customer') => {
    await delay(800);
    if (users.some(u => u.email === email)) {
      throw new Error("User already exists with this email");
    }
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      password,
      role,
      createdAt: new Date(),
    };
    users.push(newUser);
    // Don't send password to front end
    const { password: _, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword };
  },
};

// Events API
export const eventsAPI = {
  getAllEvents: async () => {
    await delay(500);
    return [...events];
  },
  getEventById: async (id: string) => {
    await delay(300);
    const event = events.find(e => e.id === id);
    if (!event) {
      throw new Error("Event not found");
    }
    return { ...event };
  },
  createEvent: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    await delay(800);
    const newEvent: Event = {
      ...eventData,
      id: String(events.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(newEvent);
    return { ...newEvent };
  },
  updateEvent: async (id: string, eventData: Partial<Event>) => {
    await delay(800);
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    events[eventIndex] = {
      ...events[eventIndex],
      ...eventData,
      updatedAt: new Date(),
    };
    return { ...events[eventIndex] };
  },
  deleteEvent: async (id: string) => {
    await delay(800);
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    events = events.filter(e => e.id !== id);
    return { success: true };
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    await delay(800);
    const event = events.find(e => e.id === bookingData.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Check existing bookings to ensure there's capacity
    const existingTicketsBooked = bookings
      .filter(b => b.eventId === bookingData.eventId && b.status !== 'cancelled')
      .reduce((sum, booking) => sum + booking.numberOfTickets, 0);
    
    if (existingTicketsBooked + bookingData.numberOfTickets > event.capacity) {
      throw new Error("Not enough tickets available");
    }
    
    const newBooking: Booking = {
      ...bookingData,
      id: String(bookings.length + 1),
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    bookings.push(newBooking);
    
    // Create notification for admin
    const newNotification: Notification = {
      id: String(notifications.length + 1),
      userId: event.createdBy,
      message: `New booking for event "${event.title}"`,
      type: 'booking',
      isRead: false,
      relatedId: newBooking.id,
      createdAt: new Date(),
    };
    
    notifications.push(newNotification);
    
    return { ...newBooking };
  },
  getUserBookings: async (userId: string) => {
    await delay(500);
    return bookings.filter(b => b.userId === userId).map(booking => {
      const event = events.find(e => e.id === booking.eventId);
      return {
        ...booking,
        event,
      };
    });
  },
  getEventBookings: async (eventId: string) => {
    await delay(500);
    return bookings.filter(b => b.eventId === eventId).map(booking => {
      const user = users.find(u => u.id === booking.userId);
      const { password: _, ...userWithoutPassword } = user || { password: '' };
      return {
        ...booking,
        user: userWithoutPassword,
      };
    });
  },
  cancelBooking: async (id: string) => {
    await delay(800);
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      throw new Error("Booking not found");
    }
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      status: 'cancelled',
      updatedAt: new Date(),
    };
    return { ...bookings[bookingIndex] };
  },
};

// Categories API
export const categoriesAPI = {
  getAllCategories: async () => {
    await delay(300);
    return [...categories];
  },
  getCategoryById: async (id: string) => {
    await delay(200);
    const category = categories.find(c => c.id === id);
    if (!category) {
      throw new Error("Category not found");
    }
    return { ...category };
  },
};

// Notifications API
export const notificationsAPI = {
  getUserNotifications: async (userId: string) => {
    await delay(300);
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  },
  markAsRead: async (id: string) => {
    await delay(200);
    const notifIndex = notifications.findIndex(n => n.id === id);
    if (notifIndex === -1) {
      throw new Error("Notification not found");
    }
    notifications[notifIndex] = {
      ...notifications[notifIndex],
      isRead: true,
    };
    return { ...notifications[notifIndex] };
  },
  markAllAsRead: async (userId: string) => {
    await delay(500);
    notifications = notifications.map(n => {
      if (n.userId === userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    return { success: true };
  },
};
