'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'order' | 'client';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  date: string; // ISO date string
  title: string;
  message: string;
  read: boolean;
  link: string;
}

interface AdminDataContextProps {
  orders: any[];
  clients: any[];
  notifications: AdminNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
  triggerRefresh: (isBackground?: boolean) => Promise<void>;
  initializeData: (orders: any[]) => void;
}

const AdminDataContext = createContext<AdminDataContextProps>({
  orders: [],
  clients: [],
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
  isLoading: true,
  triggerRefresh: async () => {},
  initializeData: () => {}
});

export function useAdminData() {
  return useContext(AdminDataContext);
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now());

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lumira_admin_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('lumira_admin_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Compute clients from orders
  useEffect(() => {
    const uniqueClientsMap = new Map();
    orders.forEach((order) => {
      if (order.whatsapp && !uniqueClientsMap.has(order.whatsapp)) {
        uniqueClientsMap.set(order.whatsapp, {
          id: order.id,
          name: order.name,
          whatsapp: order.whatsapp,
          city: order.city,
          address: order.address,
          date: order.date,
          orderCount: 1,
          totalSpent: order.total
        });
      } else if (order.whatsapp) {
        const client = uniqueClientsMap.get(order.whatsapp);
        client.orderCount += 1;
        client.totalSpent += order.total;
        if (new Date(order.date) > new Date(client.date)) {
          client.date = order.date; // keep most recent date
        }
      }
    });
    setClients(Array.from(uniqueClientsMap.values()));
  }, [orders]);

  const triggerRefresh = async (isBackground = true) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pedidos');
      if (res.ok) {
        const data = await res.json();
        const newOrders = data.orders || [];
        
        // Find new orders that we didn't have before to create notifications
        const oldOrderIds = new Set(orders.map(o => o.id));
        const newOrdersAdded = newOrders.filter((o: any) => !oldOrderIds.has(o.id));
        
        if (newOrdersAdded.length > 0) {
          const newNotifs: AdminNotification[] = newOrdersAdded.map((o: any) => ({
            id: `notif_order_${o.id}`,
            type: 'order',
            date: new Date().toISOString(),
            title: `Nuevo pedido: ${o.orderNumber || o.id.slice(0,8)}`,
            message: `El cliente ${o.name} ha realizado una compra por $${o.total.toLocaleString('es-CO')}.`,
            read: false,
            link: '/admin/pedidos'
          }));
          
          setNotifications(prev => [...newNotifs, ...prev]);
          toast.success(`Tienes ${newOrdersAdded.length} nuevo(s) pedido(s)`);
        }

        setOrders(newOrders);
        setLastCheckTime(Date.now());
      }
    } catch (error) {
      console.error('Error fetching latest orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll every 20 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      triggerRefresh(true);
    }, 20000);
    
    return () => clearInterval(intervalId);
  }, [orders]); // rebind when orders change so we have latest state to compare

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const initializeData = (initialOrders: any[]) => {
    if (orders.length === 0 && initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  };

  return (
    <AdminDataContext.Provider value={{
      orders,
      clients,
      notifications,
      markAsRead,
      markAllAsRead,
      isLoading,
      triggerRefresh,
      initializeData
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}
