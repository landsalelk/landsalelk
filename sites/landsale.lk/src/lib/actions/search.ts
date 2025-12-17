"use server"

import { createAdminClient, getCurrentUser } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"
import { Query, ID } from "node-appwrite"
import { calculateDistance, getBoundingBox } from "@/lib/services/geocoding"

// Types
export interface SavedSearchParams {
    name: string
    searchParams: Record<string, string>
    frequency: "instant" | "daily" | "weekly"
}

export interface SavedSearch {
    id: string
    name: string
    searchParams: Record<string, string>
    frequency: "instant" | "daily" | "weekly"
    isActive: boolean
    lastSentAt?: string
    createdAt: string
}

export interface AdvancedFilters {
    province?: string
    city?: string
    type?: string
    minPrice?: number
    maxPrice?: number
    minSize?: number
    maxSize?: number
    beds?: number
    baths?: number
    features?: string[]
    lat?: number
    lng?: number
    radiusKm?: number
    sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "views" | "distance"
    limit?: number
    offset?: number
}

export interface SearchResult {
    id: string
    title: string
    price: number
    location: any
    images: string[]
    type: string
    beds?: number
    baths?: number
    size?: string
    distance?: number
    featured: boolean
    views: number
    createdAt: string
}

/**
 * Save a search for alerts
 */
export async function saveSearch(params: SavedSearchParams): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: "Not authenticated" }
        }

        const { databases } = await createAdminClient()

        // Check if user has too many saved searches (limit to 10)
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SAVED_SEARCHES,
            [Query.equal("user_id", user.$id), Query.limit(11)]
        )

        if (existing.documents.length >= 10) {
            return { success: false, error: "Maximum 10 saved searches allowed. Please delete one first." }
        }

        // Create the saved search
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.SAVED_SEARCHES,
            ID.unique(),
            {
                user_id: user.$id,
                name: params.name,
                search_params: JSON.stringify(params.searchParams),
                frequency: params.frequency,
                is_active: true
            }
        )

        return { success: true, id: doc.$id }
    } catch (error: any) {
        console.error("Error saving search:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Get user's saved searches
 */
export async function getSavedSearches(): Promise<SavedSearch[]> {
    try {
        const user = await getCurrentUser()
        if (!user) return []

        const { databases } = await createAdminClient()
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SAVED_SEARCHES,
            [
                Query.equal("user_id", user.$id),
                Query.orderDesc("$createdAt"),
                Query.limit(10)
            ]
        )

        return result.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            searchParams: JSON.parse(doc.search_params || "{}"),
            frequency: doc.frequency,
            isActive: doc.is_active,
            lastSentAt: doc.last_sent_at,
            createdAt: doc.$createdAt
        }))
    } catch (error) {
        console.error("Error fetching saved searches:", error)
        return []
    }
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: "Not authenticated" }
        }

        const { databases } = await createAdminClient()

        // Verify ownership
        const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.SAVED_SEARCHES, searchId)
        if (doc.user_id !== user.$id) {
            return { success: false, error: "Unauthorized" }
        }

        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SAVED_SEARCHES, searchId)
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting saved search:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Toggle saved search active status
 */
export async function toggleSavedSearch(searchId: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: false, error: "Not authenticated" }
        }

        const { databases } = await createAdminClient()

        // Get current state
        const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.SAVED_SEARCHES, searchId)
        if (doc.user_id !== user.$id) {
            return { success: false, error: "Unauthorized" }
        }

        const newState = !doc.is_active
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.SAVED_SEARCHES,
            searchId,
            { is_active: newState }
        )

        return { success: true, isActive: newState }
    } catch (error: any) {
        console.error("Error toggling saved search:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Advanced property search with all filters
 */
export async function searchPropertiesAdvanced(filters: AdvancedFilters): Promise<{
    properties: SearchResult[]
    total: number
    hasMore: boolean
}> {
    try {
        const { databases } = await createAdminClient()
        const queries: any[] = [Query.equal("status", "active")]

        // Location filters
        if (filters.province) {
            // Province is stored in location JSON - we need to search differently
            // For now, search in title/description as a workaround
            queries.push(Query.search("description", filters.province))
        }

        // Property type filter
        if (filters.type && filters.type !== "all") {
            queries.push(Query.contains("description", filters.type))
        }

        // Price filters
        if (filters.minPrice) {
            queries.push(Query.greaterThanEqual("price", filters.minPrice))
        }
        if (filters.maxPrice) {
            queries.push(Query.lessThanEqual("price", filters.maxPrice))
        }

        // Sorting
        switch (filters.sortBy) {
            case "price_low":
                queries.push(Query.orderAsc("price"))
                break
            case "price_high":
                queries.push(Query.orderDesc("price"))
                break
            case "views":
                queries.push(Query.orderDesc("views_count"))
                break
            case "oldest":
                queries.push(Query.orderAsc("$createdAt"))
                break
            case "newest":
            default:
                queries.push(Query.orderDesc("$createdAt"))
        }

        // Pagination
        const limit = filters.limit || 20
        const offset = filters.offset || 0
        queries.push(Query.limit(limit + 1)) // +1 to check hasMore
        if (offset > 0) {
            queries.push(Query.offset(offset))
        }

        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LISTINGS, queries)

        let properties: SearchResult[] = result.documents.map(doc => {
            const location = typeof doc.location === 'string' ? JSON.parse(doc.location || '{}') : doc.location
            const attributes = typeof doc.attributes === 'string' ? JSON.parse(doc.attributes || '{}') : doc.attributes
            const title = typeof doc.title === 'string' ?
                (doc.title.startsWith('{') ? JSON.parse(doc.title)?.en || doc.title : doc.title) :
                doc.title?.en || ''

            return {
                id: doc.$id,
                title,
                price: doc.price,
                location,
                images: doc.images || [],
                type: doc.listing_type || 'sale',
                beds: attributes?.bedrooms,
                baths: attributes?.bathrooms,
                size: attributes?.size,
                featured: doc.is_premium || false,
                views: doc.views_count || 0,
                createdAt: doc.$createdAt
            }
        })

        // Calculate distance if location provided
        if (filters.lat && filters.lng) {
            properties = properties.map(p => {
                if (p.location?.lat && p.location?.lng) {
                    const distance = calculateDistance(
                        filters.lat!,
                        filters.lng!,
                        p.location.lat,
                        p.location.lng
                    )
                    return { ...p, distance }
                }
                return p
            })

            // Filter by radius if specified
            if (filters.radiusKm) {
                properties = properties.filter(p =>
                    p.distance !== undefined && p.distance <= filters.radiusKm!
                )
            }

            // Sort by distance if requested
            if (filters.sortBy === "distance") {
                properties.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
            }
        }

        const hasMore = result.documents.length > limit
        if (hasMore) {
            properties = properties.slice(0, limit)
        }

        return {
            properties,
            total: result.total,
            hasMore
        }
    } catch (error) {
        console.error("Error in advanced search:", error)
        return { properties: [], total: 0, hasMore: false }
    }
}

/**
 * Get properties within a radius of a point
 */
export async function getPropertiesNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    limit: number = 20
): Promise<SearchResult[]> {
    const result = await searchPropertiesAdvanced({
        lat,
        lng,
        radiusKm,
        sortBy: "distance",
        limit
    })
    return result.properties
}
