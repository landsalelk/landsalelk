"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Bell, Bookmark, Loader2 } from "lucide-react"
import { saveSearch } from "@/lib/actions/search"
import { toast } from "sonner"
import { pixelEvents } from "@/components/analytics/MetaPixel"

interface SaveSearchDialogProps {
    currentParams: Record<string, string>
    onSaved?: () => void
    trigger?: React.ReactNode
}

export function SaveSearchDialog({ currentParams, onSaved, trigger }: SaveSearchDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily")
    const [isLoading, setIsLoading] = useState(false)

    // Generate default name based on filters
    const generateDefaultName = () => {
        const parts: string[] = []
        if (currentParams.province) parts.push(currentParams.province)
        if (currentParams.city) parts.push(currentParams.city)
        if (currentParams.type && currentParams.type !== 'all') parts.push(currentParams.type)
        if (parts.length === 0) parts.push("All Properties")
        return parts.join(" - ")
    }

    const handleOpen = (isOpen: boolean) => {
        if (isOpen && !name) {
            setName(generateDefaultName())
        }
        setOpen(isOpen)
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a name for this search")
            return
        }

        setIsLoading(true)
        try {
            const result = await saveSearch({
                name: name.trim(),
                searchParams: currentParams,
                frequency
            })

            if (result.success) {
                toast.success("Search saved! You'll get notified of new matches.")
                // Track SaveSearch event with Meta Pixel
                pixelEvents.saveSearch(name.trim(), currentParams)
                setOpen(false)
                setName("")
                onSaved?.()
            } else {
                toast.error(result.error || "Failed to save search")
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Get summary of current filters
    const filterSummary = () => {
        const parts: string[] = []
        if (currentParams.province) parts.push(`Province: ${currentParams.province}`)
        if (currentParams.city) parts.push(`City: ${currentParams.city}`)
        if (currentParams.type && currentParams.type !== 'all') parts.push(`Type: ${currentParams.type}`)
        if (currentParams.minPrice || currentParams.maxPrice) {
            const min = currentParams.minPrice || '0'
            const max = currentParams.maxPrice || 'any'
            parts.push(`Price: Rs.${min} - Rs.${max}`)
        }
        if (currentParams.beds && currentParams.beds !== '0') parts.push(`Beds: ${currentParams.beds}+`)
        if (currentParams.baths && currentParams.baths !== '0') parts.push(`Baths: ${currentParams.baths}+`)
        return parts.length > 0 ? parts.join(", ") : "All properties (no filters)"
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Bookmark className="h-4 w-4" />
                        Save Search
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-emerald-600" />
                        Save This Search
                    </DialogTitle>
                    <DialogDescription>
                        Get notified when new properties match your search criteria.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Filters Summary */}
                    <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Current Filters</p>
                        <p className="text-sm">{filterSummary()}</p>
                    </div>

                    {/* Search Name */}
                    <div className="space-y-2">
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input
                            id="search-name"
                            placeholder="e.g., Colombo Houses Under 50M"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    {/* Alert Frequency */}
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Alert Frequency</Label>
                        <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="instant">
                                    <span className="flex items-center gap-2">
                                        🔔 Instant - Notify immediately
                                    </span>
                                </SelectItem>
                                <SelectItem value="daily">
                                    <span className="flex items-center gap-2">
                                        📅 Daily - Once per day digest
                                    </span>
                                </SelectItem>
                                <SelectItem value="weekly">
                                    <span className="flex items-center gap-2">
                                        📆 Weekly - Once per week digest
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {frequency === 'instant' && "You'll get an email/notification as soon as a new property matches."}
                            {frequency === 'daily' && "You'll get a summary of new matches every morning."}
                            {frequency === 'weekly' && "You'll get a summary of new matches every Sunday."}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Bell className="h-4 w-4 mr-2" />
                                Save & Get Alerts
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
