'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Loader2, Map as MapIcon, List } from 'lucide-react';
import Link from 'next/link';

// Fix for default Leaflet markers in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map events like move end
function MapController({ onBoundsChange }) {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
            // You could also trigger a search here if "Search as I move" is enabled
        },
    });
    return null;
}

export function MapSearch({ listings = [], initialCenter = [7.8731, 80.7718], initialZoom = 8 }) {
    const [activeListing, setActiveListing] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize markers to prevent unnecessary re-renders
    const markers = useMemo(() => {
        return listings.map(listing => {
            // Rough coordinate estimation if not present (Just for Demo/Fallback)
            // Real app should have lat/lng stored.
            // Here we assume listing has lat/lng or we skip
            if (!listing.latitude || !listing.longitude) return null;

            return (
                <Marker
                    key={listing.$id}
                    position={[listing.latitude, listing.longitude]}
                    icon={defaultIcon}
                    eventHandlers={{
                        click: () => setActiveListing(listing),
                    }}
                >
                </Marker>
            );
        }).filter(Boolean);
    }, [listings]);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers}

                {activeListing && (
                    <Popup
                        position={[activeListing.latitude, activeListing.longitude]}
                        onClose={() => setActiveListing(null)}
                        className="custom-popup"
                    >
                        <div className="min-w-[280px]">
                            <PropertyCard property={activeListing} compact={true} />
                        </div>
                    </Popup>
                )}

                <MapController onBoundsChange={(bounds) => console.log('Bounds:', bounds)} />
            </MapContainer>

            {/* Quick Toggle for Mobile */}
            <div className="absolute top-4 right-4 z-[500] md:hidden">
                <Link href="/properties" className="bg-white p-3 rounded-full shadow-lg flex items-center justify-center text-slate-700">
                    <List className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
