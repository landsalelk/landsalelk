'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, CheckCheck, X, MessageCircle, Home, Heart, AlertTriangle, DollarSign, User } from 'lucide-react';

// Mock notifications data - in production, fetch from Appwrite 'notifications' collection
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'offer',
        title: 'New Offer Received',
        message: 'You received a new offer of LKR 25,000,000 on your property "Luxury Villa in Colombo 7"',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        link: '/dashboard?section=offers'
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'John Doe sent you a message about "Spacious Apartment in Dehiwala"',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        link: '/messages'
    },
    {
        id: '3',
        type: 'listing',
        title: 'Listing Approved',
        message: 'Your listing "Land in Negombo" has been approved and is now live!',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        link: '/properties/123'
    },
    {
        id: '4',
        type: 'favorite',
        title: 'Price Drop Alert',
        message: 'A property you saved has reduced its price by 10%',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        link: '/properties/456'
    },
    {
        id: '5',
        type: 'alert',
        title: 'Listing Expiring Soon',
        message: 'Your listing "Beach House in Weligama" expires in 3 days. Renew now!',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        link: '/dashboard?section=listings'
    }
];

function getNotificationIcon(type) {
    switch (type) {
        case 'offer': return <DollarSign className="w-5 h-5" />;
        case 'message': return <MessageCircle className="w-5 h-5" />;
        case 'listing': return <Home className="w-5 h-5" />;
        case 'favorite': return <Heart className="w-5 h-5" />;
        case 'alert': return <AlertTriangle className="w-5 h-5" />;
        default: return <Bell className="w-5 h-5" />;
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'offer': return 'bg-amber-100 text-amber-600';
        case 'message': return 'bg-blue-100 text-blue-600';
        case 'listing': return 'bg-emerald-100 text-emerald-600';
        case 'favorite': return 'bg-pink-100 text-pink-600';
        case 'alert': return 'bg-red-100 text-red-600';
        default: return 'bg-slate-100 text-slate-600';
    }
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState('all'); // all, unread
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                <Bell className="w-5 h-5 text-slate-500" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-up">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" /> Mark all read
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setFilter('all')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${filter === 'unread'
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.read ? 'bg-emerald-50/50' : ''
                                            }`}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            window.location.href = notification.link;
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`font-bold text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-slate-400 mt-1 block">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <h4 className="font-bold text-slate-700">No notifications</h4>
                                    <p className="text-sm text-slate-500">You're all caught up!</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100 flex justify-between items-center">
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-red-500 font-bold hover:underline"
                                >
                                    Clear All
                                </button>
                                <a
                                    href="/notifications"
                                    className="text-xs text-emerald-600 font-bold hover:underline"
                                >
                                    View All →
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
