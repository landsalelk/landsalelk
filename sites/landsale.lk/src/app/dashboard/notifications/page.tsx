import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/appwrite/server"
import { getUserNotifications, markAllNotificationsRead } from "@/lib/actions/notifications"
import { Bell, Check, CheckCheck, Trash2, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Notifications | LandSale.lk",
    description: "View your notifications and alerts"
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

export default async function NotificationsPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    const notifications = await getUserNotifications(50)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated with your property alerts</p>
                </div>
                {notifications.length > 0 && (
                    <form action={async () => {
                        "use server"
                        await markAllNotificationsRead()
                    }}>
                        <Button variant="outline" size="sm" type="submit">
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    </form>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            When someone interacts with your listings or when there are updates matching your saved searches, you'll see them here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''}`}
                        >
                            <CardContent className="flex items-start gap-4 p-4">
                                <span className="text-2xl mt-1">
                                    {notificationIcons[notification.type] || "🔔"}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!notification.isRead && (
                                                <Badge variant="default" className="bg-blue-500">New</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {notification.link && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={notification.link}>
                                                    View <ArrowRight className="h-3 w-3 ml-1" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
