'use client';

import { useState, useEffect } from 'react';
import { Hero } from "@/components/home/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { getFeaturedProperties } from "@/lib/properties";
import { ArrowRight, Sparkles, ShieldCheck, Brain, Scale, PlusCircle, Home, Building, Trees, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fallback properties for demo
  const fallbackProperties = [
    {
      $id: 'demo-1',
      title: "10 Perch Residential Land",
      location: "Malabe, Colombo",
      price: 55000000,
      listing_type: "Land",
      badge: "Featured",
      images: JSON.stringify(["https://images.unsplash.com/photo-1629079447841-d60235609ef9?q=80&w=2070"])
    },
    {
      $id: 'demo-2',
      title: "Luxury Modern House",
      location: "Nawala, Rajagiriya",
      price: 45000000,
      listing_type: "Sale",
      beds: 4,
      baths: 3,
      size_sqft: 2500,
      badge: "New",
      images: JSON.stringify(["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070"])
    },
    {
      $id: 'demo-3',
      title: "Coconut Land Plot",
      location: "Kurunegala",
      price: 22500000,
      listing_type: "Land",
      size_sqft: 4000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1550149727-2c9b4e7a331d?q=80&w=2070"])
    },
    {
      $id: 'demo-4',
      title: "Skyline Apartment",
      location: "Havelock City, Colombo",
      price: 65000000,
      listing_type: "Sale",
      beds: 3,
      baths: 2,
      size_sqft: 1800,
      badge: "Hot Deal",
      images: JSON.stringify(["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"])
    },
  ];

  useEffect(() => {
    setMounted(true);
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const properties = await getFeaturedProperties(8);
      if (properties.length > 0) {
        setFeaturedProperties(properties);
      } else {
        // Use fallback if no real properties
        setFeaturedProperties(fallbackProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setFeaturedProperties(fallbackProperties);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Lands', icon: Trees, href: '/properties?type=land', count: '5,000+', color: 'bg-green-50 text-green-600' },
    { name: 'Houses', icon: Home, href: '/properties?type=sale', count: '8,000+', color: 'bg-blue-50 text-blue-600' },
    { name: 'Apartments', icon: Building, href: '/properties?type=apartment', count: '2,000+', color: 'bg-purple-50 text-purple-600' },
  ];

  const valueProps = [
    {
      icon: ShieldCheck,
      title: "Verified Listings",
      description: "Every property is verified by our team for authenticity",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: Brain,
      title: "AI Valuation",
      description: "Get instant property valuations powered by AI",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Scale,
      title: "Legal Support",
      description: "Free legal document checklist for every transaction",
      color: "bg-purple-100 text-purple-600"
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen animate-fade-in">
      <Hero />

      {/* Categories Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} href={cat.href}>
                <div className="glass-card rounded-3xl p-8 flex items-center gap-6 cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#10b981] transition-colors">{cat.name}</h3>
                    <p className="text-slate-500 font-medium">{cat.count} Properties</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ecfdf5] text-[#10b981] px-3 py-1.5 rounded-full text-sm font-bold mb-3">
                <Sparkles className="w-4 h-4" /> Featured Listings
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Handpicked Properties</h2>
              <p className="text-slate-500 mt-2">Verified listings from trusted sellers across Sri Lanka</p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-[#10b981] font-bold hover:underline"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property, idx) => (
                <div
                  key={property.$id || idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#10b981] via-[#06b6d4] to-[#3b82f6] p-12 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Sell Your Property?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                List your property for free and reach thousands of potential buyers across Sri Lanka.
                Get AI-powered valuation and verified badge.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/properties/create"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#10b981] rounded-2xl font-bold hover:bg-slate-100 transition-colors shadow-xl"
                >
                  <PlusCircle className="w-5 h-5" />
                  Post Free Ad
                </Link>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 text-white rounded-2xl font-bold hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  Find an Agent
                </Link>
              </div>
            </div>

            {/* Decorative House */}
            <div className="absolute right-8 bottom-0 w-64 h-64 opacity-30 hidden lg:block">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M40 180V100L100 40L160 100V180H40Z" fill="white" opacity="0.3" />
                <path d="M30 100L100 30L170 100" stroke="white" strokeWidth="6" opacity="0.5" />
                <rect x="80" y="120" width="40" height="60" fill="white" opacity="0.3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Why Choose LandSale.lk?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Sri Lanka's most trusted real estate platform with AI-powered tools and verified listings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="glass-card rounded-3xl p-8 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${prop.color} group-hover:scale-110 transition-transform`}>
                  <prop.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{prop.title}</h3>
                <p className="text-slate-500">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Get the Latest Property Alerts
          </h2>
          <p className="text-slate-500 mb-8">
            Subscribe to receive notifications about new listings and price drops
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:border-[#10b981] font-medium"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#10b981] text-white rounded-2xl font-bold hover:bg-[#059669] transition-colors shadow-lg shadow-[#10b981]/30"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
