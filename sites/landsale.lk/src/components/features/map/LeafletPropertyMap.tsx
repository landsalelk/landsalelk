"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Locate, Loader2 } from "lucide-react"

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

// Featured property icon (golden)
const featuredIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

export interface MapPropertyPin {
    id: string
    lat: number
    lng: number
    propertyId: string
    price: number
    title: string
    type: 'land' | 'house' | 'commercial' | string
    featured?: boolean
    image?: string
}

interface LeafletMapProps {
    pins: MapPropertyPin[]
    center?: [number, number]
    zoom?: number
    className?: string
    onPinClick?: (pin: MapPropertyPin) => void
    hoveredPinId?: string
}

// Component to handle map events and updates
function MapController({ center, zoom, userLocation }: { center: [number, number], zoom: number, userLocation?: [number, number] | null }) {
    const map = useMap()

    useEffect(() => {
        if (userLocation) {
            map.setView(userLocation, 14)
        } else {
            map.setView(center, zoom)
        }
    }, [map, center, zoom, userLocation])

    return null
}

export function LeafletPropertyMap({
    pins,
    center = [7.8731, 80.7718], // Sri Lanka center
    zoom = 8,
    className = "",
    onPinClick,
    hoveredPinId
}: LeafletMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [isLocating, setIsLocating] = useState(false)

    // Only render map on client side
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Handle locate me
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude])
                setIsLocating(false)
            },
            (error) => {
                console.error("Geolocation error:", error)
                alert("Could not get your location")
                setIsLocating(false)
            }
        )
    }

    if (!isMounted) {
        return (
            <div className={`bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
                <div className="text-muted-foreground">Loading map...</div>
            </div>
        )
    }

    return (
        <div className={`rounded-xl overflow-hidden shadow-lg ${className}`}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: "100%", minHeight: "400px", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={center} zoom={zoom} userLocation={userLocation} />

                {/* User Location Marker */}
                {userLocation && (
                    <CircleMarker
                        center={userLocation}
                        radius={10}
                        pathOptions={{
                            fillColor: "#3b82f6",
                            fillOpacity: 0.8,
                            color: "white",
                            weight: 3
                        }}
                    >
                        <Popup>You are here</Popup>
                    </CircleMarker>
                )}

                {pins.map((pin) => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={pin.featured ? featuredIcon : defaultIcon}
                        eventHandlers={{
                            click: () => onPinClick?.(pin)
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                {pin.image && (
                                    <img
                                        src={pin.image}
                                        alt={pin.title}
                                        className="w-full h-24 object-cover rounded-t-lg mb-2"
                                    />
                                )}
                                <h3 className="font-semibold text-sm line-clamp-1">{pin.title}</h3>
                                <p className="text-emerald-600 font-bold mt-1">
                                    LKR {formatPrice(pin.price)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize mt-1">
                                    {pin.type}
                                </p>
                                <Link
                                    href={`/properties/${pin.propertyId}`}
                                    className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                                >
                                    View Details →
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Locate Me Button */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-[1000] bg-white shadow-lg hover:bg-slate-50"
                onClick={handleLocateMe}
                disabled={isLocating}
                title="Find my location"
            >
                {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Locate className="h-4 w-4" />
                )}
            </Button>
        </div>
    )
}

// Search page map with multiple properties
export function PropertySearchMap({
    properties,
    className = ""
}: {
    properties: Array<{
        id: string
        title: string
        price: number
        lat?: number
        lng?: number
        type: string
        featured?: boolean
        image?: string
    }>
    className?: string
}) {
    // Filter properties with valid coordinates
    const pins: MapPropertyPin[] = properties
        .filter(p => p.lat && p.lng)
        .map(p => ({
            id: p.id,
            lat: p.lat!,
            lng: p.lng!,
            propertyId: p.id,
            price: p.price,
            title: p.title,
            type: p.type,
            featured: p.featured,
            image: p.image
        }))

    // Calculate center from pins or default to Sri Lanka
    const center: [number, number] = pins.length > 0
        ? [
            pins.reduce((sum, p) => sum + p.lat, 0) / pins.length,
            pins.reduce((sum, p) => sum + p.lng, 0) / pins.length
        ]
        : [7.8731, 80.7718]

    return (
        <LeafletPropertyMap
            pins={pins}
            center={center}
            zoom={pins.length > 0 ? 10 : 8}
            className={className}
        />
    )
}

// Single property detail map
export function PropertyDetailMap({
    lat,
    lng,
    title,
    price,
    propertyId,
    className = ""
}: {
    lat: number
    lng: number
    title: string
    price: number
    propertyId: string
    className?: string
}) {
    const pins: MapPropertyPin[] = [{
        id: propertyId,
        lat,
        lng,
        propertyId,
        price,
        title,
        type: 'property'
    }]

    return (
        <LeafletPropertyMap
            pins={pins}
            center={[lat, lng]}
            zoom={15}
            className={className}
        />
    )
}
