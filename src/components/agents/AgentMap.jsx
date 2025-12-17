'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { User, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

// Fix for default Leaflet marker icons in Next.js/React
const customIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

export default function AgentMap({ agents }) {
    // Default center (Colombo, Sri Lanka)
    const center = [6.9271, 79.8612];

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {agents
                .filter(agent => agent.lat && agent.lng) // Only show agents with real coordinates
                .map(agent => {
                    return (
                        <Marker key={agent.$id} position={[agent.lat, agent.lng]} icon={customIcon}>
                            <Popup className="agent-popup">
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                                            <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Verified
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-3">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold text-slate-700">{agent.rating || '4.8'}</span>
                                        <span className="text-xs text-slate-400">({agent.total_reviews || 0} reviews)</span>
                                    </div>
                                    <Link
                                        href={`/agents/${agent.$id}`}
                                        className="block w-full py-2 bg-slate-900 text-white text-center text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
        </MapContainer>
    );
}
