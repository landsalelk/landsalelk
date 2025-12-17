/**
 * Geocoding Service using OpenStreetMap Nominatim API (Free, no API key required)
 * Rate limit: 1 request per second
 * 
 * Note: This is a utility module, not a server action file.
 * Use these functions from server actions or API routes.
 */

export interface GeocodingResult {
    lat: number
    lng: number
    displayName: string
    city?: string
    district?: string
    country?: string
}

// Sri Lanka bounding box for better results
const SRI_LANKA_BOUNDS = {
    viewbox: "79.5,5.9,82.0,9.9",
    countrycodes: "lk"
}

// Sri Lanka center coordinates
export const SRI_LANKA_CENTER = {
    lat: 7.8731,
    lng: 80.7718,
    zoom: 8
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!address || address.length < 3) return null

    try {
        const params = new URLSearchParams({
            q: address,
            format: "json",
            limit: "1",
            addressdetails: "1",
            ...SRI_LANKA_BOUNDS
        })

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params}`,
            {
                headers: {
                    "User-Agent": "LandSale.lk/1.0 (contact@landsale.lk)"
                },
                next: { revalidate: 86400 } // Cache for 24 hours
            }
        )

        if (!response.ok) {
            console.error("Geocoding API error:", response.status)
            return null
        }

        const data = await response.json()

        if (!data || data.length === 0) {
            return null
        }

        const result = data[0]
        const addr = result.address || {}

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            city: addr.city || addr.town || addr.village || addr.suburb,
            district: addr.state_district || addr.county || addr.state,
            country: addr.country
        }
    } catch (error) {
        console.error("Geocoding error:", error)
        return null
    }
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lon: lng.toString(),
            format: "json",
            addressdetails: "1"
        })

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params}`,
            {
                headers: {
                    "User-Agent": "LandSale.lk/1.0 (contact@landsale.lk)"
                },
                next: { revalidate: 86400 }
            }
        )

        if (!response.ok) return null

        const result = await response.json()
        const addr = result.address || {}

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
            city: addr.city || addr.town || addr.village || addr.suburb,
            district: addr.state_district || addr.county || addr.state,
            country: addr.country
        }
    } catch (error) {
        console.error("Reverse geocoding error:", error)
        return null
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * Get bounding box for radius search
 * Returns [minLat, minLng, maxLat, maxLng]
 */
export function getBoundingBox(
    lat: number,
    lng: number,
    radiusKm: number
): [number, number, number, number] {
    // Approximate degrees per km at this latitude
    const latDelta = radiusKm / 111.0 // ~111 km per degree latitude
    const lngDelta = radiusKm / (111.0 * Math.cos(toRad(lat)))

    return [
        lat - latDelta,  // minLat
        lng - lngDelta,  // minLng
        lat + latDelta,  // maxLat
        lng + lngDelta   // maxLng
    ]
}
