"use client";

<<<<<<< HEAD
import { useParams } from "next/navigation";
import Image from "next/image";
import { MapPin, School, Building, Coffee, TrendingUp } from "lucide-react";
import Link from "next/link";

// Mock Data (would typically come from API)
const areaData = {
  "colombo-7": {
    name: "Cinnamon Gardens (Colombo 7)",
    description:
      "Colombo 7, also known as Cinnamon Gardens, is the most affluent neighborhood in Colombo, Sri Lanka. It is characterized by beautiful colonial architecture, leafy avenues, and high-end residential properties. The area is home to foreign embassies, elite schools, and lush parks.",
    image:
      "https://images.unsplash.com/photo-1590487372986-e91008d5162a?q=80&w=1000",
    stats: {
      price: "LKR 18M / perch",
      trend: "+5.2%",
      schools: "12+",
      popularity: "High",
=======
import { useParams } from 'next/navigation';
import { MapPin, School, Building, Coffee, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock Data (would typically come from API)
const areaData = {
    'colombo-7': {
        name: 'Cinnamon Gardens (Colombo 7)',
        description: 'Colombo 7, also known as Cinnamon Gardens, is the most affluent neighborhood in Colombo, Sri Lanka. It is characterized by beautiful colonial architecture, leafy avenues, and high-end residential properties. The area is home to foreign embassies, elite schools, and lush parks.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
        stats: { price: 'LKR 18M / perch', trend: '+5.2%', schools: '12+', popularity: 'High' }
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
    },
  },
  "colombo-3": {
    name: "Kollupitiya (Colombo 3)",
    description:
      "A bustling commercial and residential hub, Kollupitiya offers high-rise living with sea views. It features shopping malls, international hotels, and a vibrant dining scene.",
    image:
      "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?q=80&w=1000",
    stats: {
      price: "LKR 15M / perch",
      trend: "+4.1%",
      schools: "8+",
      popularity: "Very High",
    },
  },
};

export default function AreaDetailPage() {
<<<<<<< HEAD
  const { id } = useParams();
  const area = areaData[id] || {
    name: "Unknown Area",
    description: "Information for this area is currently being updated.",
    image:
      "https://images.unsplash.com/photo-1590487372986-e91008d5162a?q=80&w=1000",
    stats: { price: "N/A", trend: "N/A", schools: "N/A", popularity: "N/A" },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={area.image}
            alt={area.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50" />
=======
    const { id } = useParams();
    const area = areaData[id] || {
        name: 'Unknown Area',
        description: 'Information for this area is currently being updated.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
        stats: { price: 'N/A', trend: 'N/A', schools: 'N/A', popularity: 'N/A' }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative h-[50vh] w-full">
                <div className="absolute inset-0">
                    <Image
                        src={area.image}
                        alt={area.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{area.name}</h1>
                    <div className="flex items-center gap-2 text-white/80">
                        <MapPin className="w-5 h-5" />
                        <span className="text-lg">Western Province, Sri Lanka</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Neighborhood</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {area.description}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Lifestyle & Amenities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <School className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Education</h3>
                                    <p className="text-slate-500 text-sm">Top-tier international & local schools nearby.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                    <Coffee className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Dining & Cafe</h3>
                                    <p className="text-slate-500 text-sm">Vibrant cafe culture and fine dining options.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Real Estate</h3>
                                    <p className="text-slate-500 text-sm">Mix of colonial bungalows and luxury apartments.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Listings in {area.name.split('(')[0]}</h2>
                            <Link href="/properties" className="text-emerald-600 font-bold hover:underline">View All</Link>
                        </div>
                        {/* Placeholder for listings */}
                        <div className="bg-slate-50 rounded-2xl p-8 text-center border-dashed border-2 border-slate-200">
                            <p className="text-slate-500 font-medium">Top listings for this area will appear here.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" /> Market Details
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Land Price</p>
                                <p className="text-2xl font-bold text-slate-900">{area.stats.price}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Yearly Growth</p>
                                <p className="text-2xl font-bold text-emerald-600">{area.stats.trend}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Schools Nearby</p>
                                <p className="text-2xl font-bold text-slate-900">{area.stats.schools}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Demand</p>
                                <p className="text-2xl font-bold text-blue-600">{area.stats.popularity}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                Get Alert for this Area
                            </button>
                        </div>
                    </div>
                </div>
            </div>
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
        </div>
        <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-7xl p-8 md:p-12">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
            {area.name}
          </h1>
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">Western Province, Sri Lanka</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-12 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              About the Neighborhood
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              {area.description}
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Lifestyle & Amenities
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Education</h3>
                  <p className="text-sm text-slate-500">
                    Top-tier international & local schools nearby.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Dining & Cafe</h3>
                  <p className="text-sm text-slate-500">
                    Vibrant cafe culture and fine dining options.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Real Estate</h3>
                  <p className="text-sm text-slate-500">
                    Mix of colonial bungalows and luxury apartments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Listings in {area.name.split("(")[0]}
              </h2>
              <Link
                href="/properties"
                className="font-bold text-emerald-600 hover:underline"
              >
                View All
              </Link>
            </div>
            {/* Placeholder for listings */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="font-medium text-slate-500">
                Top listings for this area will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <TrendingUp className="h-5 w-5 text-emerald-600" /> Market Details
            </h3>

            <div className="space-y-6">
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Avg. Land Price
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {area.stats.price}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Yearly Growth
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {area.stats.trend}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Schools Nearby
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {area.stats.schools}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Demand
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {area.stats.popularity}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <button className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800">
                Get Alert for this Area
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
