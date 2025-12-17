"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    Notification
} from "@/lib/actions/notifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface NotificationBellProps {
    className?: string
}

// Icon mapping for notification types
const notificationIcons: Record<string, string> = {
    inquiry: "📞",
    favorite: "❤️",
    price_drop: "🔥",
    new_listing: "🏠",
    message: "💬",
    review: "⭐",
    system: "🔔",
    saved_search: "🔍"
}

export function NotificationBell({ className }: NotificationBellProps) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                getUserNotifications(10),
                getUnreadNotificationCount()
            ])
            setNotifications(notifs)
            setUnreadCount(count)
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.isRead) {
            await markNotificationRead(notification.id)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }

        // Navigate if there's a link
        if (notification.link) {
            setIsOpen(false)
            router.push(notification.link)
        }
    }

    // Mark all as read
    const handleMarkAllRead = async () => {
        const result = await markAllNotificationsRead()
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${className}`}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={handleMarkAllRead}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                We'll notify you about important updates
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <span className="text-xl mt-0.5">
                                    {notificationIcons[notification.type] || "🔔"}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium truncate ${!notification.isRead ? "text-foreground" : "text-muted-foreground"
                                            }`}>
                                            {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="justify-center text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setIsOpen(false)
                                router.push("/dashboard/notifications")
                            }}
                        >
                            View all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
