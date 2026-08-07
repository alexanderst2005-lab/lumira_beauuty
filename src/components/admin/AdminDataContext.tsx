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
  deleted?: boolean;
}

interface AdminDataContextProps {
  orders: any[];
  clients: any[];
  notifications: AdminNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
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
  deleteNotification: () => {},
  clearAllNotifications: () => {},
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
        const fetchedOrders = data.orders || [];
        
        setOrders(currentOrders => {
          // Asegurar que no haya duplicados en fetchedOrders por si Notion devuelve repetidos
          const uniqueFetchedOrders = Array.from(new Map(fetchedOrders.map((o: any) => [o.id, o])).values()) as any[];
          
          const oldOrderIds = new Set(currentOrders.map((o: any) => o.id));
          const newOrdersAdded = uniqueFetchedOrders.filter((o: any) => !oldOrderIds.has(o.id));
          
          if (newOrdersAdded.length > 0 && currentOrders.length > 0) {
            const oldClientWhatsapps = new Set(currentOrders.map((o: any) => o.whatsapp).filter(Boolean));
            const newClientsAdded = newOrdersAdded.filter((o: any) => o.whatsapp && !oldClientWhatsapps.has(o.whatsapp));

            setNotifications(prevNotifs => {
              const existingNotifIds = new Set(prevNotifs.map(n => n.id));
              
              const actuallyNewOrders = newOrdersAdded.filter((o: any) => !existingNotifIds.has(`notif_order_${o.id}`));
              const actuallyNewClients = newClientsAdded.filter((o: any) => !existingNotifIds.has(`notif_client_${o.whatsapp}`));
              
              let newNotifs: AdminNotification[] = [];
              
              if (actuallyNewOrders.length > 0) {
                 setTimeout(() => toast.success(`Tienes ${actuallyNewOrders.length} nuevo(s) pedido(s)`), 0);
                 newNotifs = [...newNotifs, ...actuallyNewOrders.map((o: any) => ({
                    id: `notif_order_${o.id}`,
                    type: 'order',
                    date: new Date().toISOString(),
                    title: `Nuevo pedido: ${o.orderNumber || o.id.slice(0,8)}`,
                    message: `El cliente ${o.name} ha realizado una compra por $${o.total.toLocaleString('es-CO')}.`,
                    read: false,
                    link: '/admin/pedidos'
                 }))];
              }

              if (actuallyNewClients.length > 0) {
                 setTimeout(() => toast.info(`¡${actuallyNewClients.length} nuevo(s) cliente(s)!`), 0);
                 newNotifs = [...newNotifs, ...actuallyNewClients.map((o: any) => ({
                    id: `notif_client_${o.whatsapp}`,
                    type: 'client',
                    date: new Date().toISOString(),
                    title: `Nuevo cliente: ${o.name}`,
                    message: `${o.name} se ha registrado como cliente nuevo.`,
                    read: false,
                    link: '/admin/clientes'
                 }))];
              }

              if (newNotifs.length > 0) {
                return [...newNotifs, ...prevNotifs];
              }
              return prevNotifs;
            });
          }
          // Siempre retornamos la lista sin duplicados
          return uniqueFetchedOrders;
        });
        
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
  }, []); // Remove dependency on orders since we use functional updates

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    // En lugar de removerlo del array, lo marcamos como deleted para que no vuelva a generarse
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, deleted: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, deleted: true })));
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
      deleteNotification,
      clearAllNotifications,
      isLoading,
      triggerRefresh,
      initializeData
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}
