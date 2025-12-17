"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Bell,
    BellOff,
    Trash2,
    Search,
    MapPin,
    DollarSign,
    Home,
    Calendar
} from "lucide-react"
import { deleteSavedSearch, toggleSavedSearch, SavedSearch } from "@/lib/actions/search"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SavedSearchCardProps {
    search: SavedSearch
    onDelete?: (id: string) => void
    onToggle?: (id: string, isActive: boolean) => void
}

export function SavedSearchCard({ search, onDelete, onToggle }: SavedSearchCardProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isActive, setIsActive] = useState(search.isActive)

    const params = search.searchParams

    // Build search URL
    const searchUrl = `/search?${new URLSearchParams(params as Record<string, string>).toString()}`

    // Format the search criteria for display
    const getCriteriaSummary = () => {
        const parts: string[] = []
        if (params.province) parts.push(params.province)
        if (params.city) parts.push(params.city)
        if (params.type && params.type !== 'all') parts.push(params.type)
        if (params.minPrice || params.maxPrice) {
            const min = params.minPrice ? `Rs.${Number(params.minPrice).toLocaleString()}` : '0'
            const max = params.maxPrice ? `Rs.${Number(params.maxPrice).toLocaleString()}` : 'any'
            parts.push(`${min} - ${max}`)
        }
        if (params.beds && params.beds !== '0') parts.push(`${params.beds}+ beds`)
        if (params.baths && params.baths !== '0') parts.push(`${params.baths}+ baths`)
        return parts
    }

    const criteria = getCriteriaSummary()

    const handleDelete = async () => {
        if (!confirm("Delete this saved search?")) return
        setIsLoading(true)
        try {
            const result = await deleteSavedSearch(search.id)
            if (result.success) {
                toast.success("Search deleted")
                onDelete?.(search.id)
            } else {
                toast.error(result.error || "Failed to delete")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            const result = await toggleSavedSearch(search.id)
            if (result.success) {
                setIsActive(result.isActive!)
                onToggle?.(search.id, result.isActive!)
                toast.success(result.isActive ? "Alerts enabled" : "Alerts paused")
            } else {
                toast.error(result.error || "Failed to update")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const frequencyLabel = {
        instant: "Instant",
        daily: "Daily",
        weekly: "Weekly"
    }[search.frequency]

    return (
        <Card className={`group transition-all hover:shadow-md ${!isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                            {search.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="text-xs"
                        >
                            {isActive ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
                            {frequencyLabel}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {/* Search Criteria */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {criteria.length > 0 ? (
                        criteria.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal capitalize">
                                {item}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground">All properties</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleToggle}
                            disabled={isLoading}
                            className="scale-90"
                        />
                        <span className="text-xs text-muted-foreground">
                            {isActive ? "Alerts on" : "Alerts off"}
                        </span>
                    </div>

                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(searchUrl)}
                            className="h-8 px-2"
                        >
                            <Search className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Empty state for no saved searches
export function SavedSearchesEmptyState() {
    return (
        <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Saved Searches</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Save your search filters to get notified when new properties match your criteria.
            </p>
        </div>
    )
}
