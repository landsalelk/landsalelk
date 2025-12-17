import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/appwrite/server"
import { getSavedSearches } from "@/lib/actions/search"
import { SavedSearchCard, SavedSearchesEmptyState } from "@/components/features/search/SavedSearchCard"
import { Bell, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Saved Searches | LandSale.lk",
    description: "Manage your saved property searches and alerts"
}

export default async function SavedSearchesPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    const savedSearches = await getSavedSearches()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Saved Searches</h1>
                    <p className="text-muted-foreground">Get notified when new properties match your criteria</p>
                </div>
                <Button asChild>
                    <Link href="/search">
                        <Plus className="h-4 w-4 mr-2" />
                        New Search
                    </Link>
                </Button>
            </div>

            {savedSearches.length === 0 ? (
                <SavedSearchesEmptyState />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {savedSearches.map((search) => (
                        <SavedSearchCard key={search.id} search={search} />
                    ))}
                </div>
            )}

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-3">
                        <Bell className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">How Saved Searches Work</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600">1.</span>
                                Search for properties with your desired filters
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600">2.</span>
                                Click "Save Search" to save your criteria
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600">3.</span>
                                We'll notify you when new properties match
                            </li>
                        </ul>
                        <Button variant="link" className="px-0 mt-2 text-emerald-600" asChild>
                            <Link href="/search">
                                <Search className="h-4 w-4 mr-2" />
                                Start Searching
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
