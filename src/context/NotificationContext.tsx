'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'system' | 'promo';
    isRead: boolean;
    timestamp: Date;
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: 'order' | 'system' | 'promo') => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([
        // Initial welcome message
        {
            id: 'welcome',
            title: 'Welcome to Ambajizon',
            message: 'Jai Ambe! Start shopping for authentic prasad and items.',
            type: 'system',
            isRead: false,
            timestamp: new Date()
        }
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (title: string, message: string, type: 'order' | 'system' | 'promo' = 'system') => {
        setNotifications(prev => [
            {
                id: Math.random().toString(36).substr(2, 9),
                title,
                message,
                type,
                isRead: false,
                timestamp: new Date()
            },
            ...prev
        ]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
