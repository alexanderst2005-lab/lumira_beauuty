'use client';

import { Bell, Menu, Search, Check, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAdminData } from './AdminDataContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export default function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useAdminData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeNotifications = notifications.filter(n => !n.deleted);
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                <div className="flex gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                      title="Marcar todo como leído"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  {activeNotifications.length > 0 && (
                    <button 
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar todas las notificaciones?')) {
                          clearAllNotifications();
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      title="Eliminar todas"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {activeNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No tienes notificaciones
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {activeNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors hover:bg-gray-50 group relative ${!notif.read ? 'bg-pink-50/30' : ''}`}
                      >
                        <div 
                          className="cursor-pointer pr-6" 
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                        >
                          <Link href={notif.link}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-semibold text-gray-900">{notif.title}</span>
                              {!notif.read && <span className="w-2 h-2 bg-pink-500 rounded-full mt-1"></span>}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notif.date), { addSuffix: true, locale: es })}
                            </span>
                          </Link>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
