'use client';

import { Hero } from "@/components/home/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Properties</h2>
              <p className="text-slate-500">Handpicked selections just for you.</p>
            </div>
            <Link href="/properties" className="flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Placeholder Cards - Later we fetch from Appwrite */}
            {[1, 2, 3, 4].map((i) => (
              <PropertyCard key={i} property={{
                title: i % 2 === 0 ? "Luxury Apartment in Colombo 3" : "Beach Land in Galle",
                price: i % 2 === 0 ? 85000000 : 45000000,
                specs: { beds: 3, baths: 2, size: 1800 },
                type: i % 2 === 0 ? "Sale" : "Land",
                image: i % 2 === 0 ?
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070" :
                  "https://images.unsplash.com/photo-1502000206303-7e02ad3f075d?q=80&w=2070"
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-100/50 rounded-full blur-3xl opacity-50" />
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop"
                alt="Mobile App"
                className="relative rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Real Estate, Simplified.</h2>
              <ul className="space-y-8">
                {[
                  { title: 'Verified Agents & Sellers', desc: 'Secure transactions with NIC-verified users and vetted agents.' },
                  { title: 'Transparent Legal Data', desc: 'View Deed Types (Sinnakkara, Bim Saviya) and approvals instantly.' },
                  { title: 'AI-Powered Insights', desc: 'Market valuations, investment predictions, and personalized matches.' },
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
