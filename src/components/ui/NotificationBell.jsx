'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Trash2, X, Wifi, WifiOff } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/notifications.client';
import { account } from '@/lib/appwrite';
import { useNotificationRealtime } from '@/hooks/useRealtime';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        // Close on outside click
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkUser = async () => {
        try {
            const userData = await account.get();
            setUser(userData);
            loadNotifications(userData.$id);
        } catch {
            setUser(null);
        }
    };

    const loadNotifications = async (userId) => {
        setLoading(true);
        const [notifs, count] = await Promise.all([
            getNotifications(userId, 10),
            getUnreadCount(userId)
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
        setLoading(false);
    };

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => n.$id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await markAllAsRead(user.$id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (notificationId) => {
        await deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n.$id !== notificationId));
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.$id}
                                    className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${!notification.is_read ? 'bg-emerald-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.$createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.$id)}
                                                    className="p-1 text-gray-400 hover:text-emerald-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.$id)}
                                                className="p-1 text-gray-400 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t bg-gray-50 text-center">
                            <a href="/dashboard?tab=notifications" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
