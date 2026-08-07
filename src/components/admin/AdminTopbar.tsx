'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export default function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const [pendingOrders, setPendingOrders] = useState(0);

  // Poll for new pending orders every minute (simple notification logic)
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch('/api/admin/pedidos/pending-count');
        if (res.ok) {
          const data = await res.json();
          setPendingOrders(data.count);
        }
      } catch (error) {
        console.error('Error fetching pending orders count', error);
      }
    };

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search (Placeholder) */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-64 focus-within:ring-2 focus-within:ring-pink-100 focus-within:border-pink-300 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar pedidos, productos..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5" />
          {pendingOrders > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
