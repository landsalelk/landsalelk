'use client';

import { MapPin, Car, Bus, Trees, ShoppingBag, GraduationCap, Utensils } from 'lucide-react';

// Since no external Walk Score API is integrated, this component provides
// mock/placeholder neighborhood data. For production, integrate with Walk Score API
// or Google Places API.

const MOCK_SCORES = {
    walkScore: 72,
    transitScore: 55,
    bikeScore: 48
};

const NEARBY_PLACES = {
    restaurants: [
        { name: 'Green Garden Cafe', distance: '0.3 km' },
        { name: 'Spice Kitchen', distance: '0.5 km' },
        { name: 'Ocean View Restaurant', distance: '0.8 km' }
    ],
    schools: [
        { name: 'Royal College', distance: '1.2 km' },
        { name: 'Ladies College', distance: '1.5 km' }
    ],
    shopping: [
        { name: 'Odel', distance: '0.4 km' },
        { name: 'Majestic City', distance: '1.0 km' }
    ],
    parks: [
        { name: 'Viharamahadevi Park', distance: '0.6 km' },
        { name: 'Independence Square', distance: '1.8 km' }
    ]
};

function ScoreCircle({ score, label, color }) {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{score}</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>
        </div>
    );
}

function PlaceCategory({ icon: Icon, title, places, color }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-700">{title}</h4>
            </div>
            <ul className="space-y-2">
                {places.map((place, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{place.name}</span>
                        <span className="text-slate-400">{place.distance}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function NeighborhoodScore({ location }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900">Neighborhood Overview</h3>
            </div>

            {/* Walkability Scores */}
            <div className="flex justify-around mb-8 pb-6 border-b border-slate-100">
                <ScoreCircle score={MOCK_SCORES.walkScore} label="Walk Score" color="#10b981" />
                <ScoreCircle score={MOCK_SCORES.transitScore} label="Transit Score" color="#3b82f6" />
                <ScoreCircle score={MOCK_SCORES.bikeScore} label="Bike Score" color="#f59e0b" />
            </div>

            {/* Score Descriptions */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                <div>
                    <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-bold">Very Walkable</span>
                    </div>
                    <p className="text-xs text-slate-500">Most errands can be accomplished on foot</p>
                </div>
                <div>
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Bus className="w-4 h-4" />
                        <span className="text-sm font-bold">Good Transit</span>
                    </div>
                    <p className="text-xs text-slate-500">Many nearby public transportation options</p>
                </div>
                <div>
                    <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                        <Car className="w-4 h-4" />
                        <span className="text-sm font-bold">Bikeable</span>
                    </div>
                    <p className="text-xs text-slate-500">Biking is convenient for most trips</p>
                </div>
            </div>

            {/* Nearby Places Grid */}
            <h4 className="font-bold text-slate-700 mb-4">Nearby Places</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaceCategory
                    icon={Utensils}
                    title="Restaurants"
                    places={NEARBY_PLACES.restaurants}
                    color="bg-orange-500"
                />
                <PlaceCategory
                    icon={GraduationCap}
                    title="Schools"
                    places={NEARBY_PLACES.schools}
                    color="bg-blue-500"
                />
                <PlaceCategory
                    icon={ShoppingBag}
                    title="Shopping"
                    places={NEARBY_PLACES.shopping}
                    color="bg-purple-500"
                />
                <PlaceCategory
                    icon={Trees}
                    title="Parks"
                    places={NEARBY_PLACES.parks}
                    color="bg-emerald-500"
                />
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-xs text-slate-400 text-center">
                Scores and nearby places are approximate. Data may vary based on actual location.
            </p>
        </div>
    );
}
