import { Hero } from "@/components/home/Hero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { getFeaturedProperties } from "@/lib/properties";
import { databases } from "@/lib/appwrite";
import { DB_ID, COLLECTION_LISTINGS } from "@/lib/constants";
import { Query } from "appwrite";
import { ArrowRight, Sparkles, ShieldCheck, Brain, Scale, PlusCircle, Home, Building, Trees, Loader2 } from "lucide-react";
import Link from "next/link";

// Server Component
export default async function HomePage() {
  // Fetch data in parallel
  const propertiesPromise = getFeaturedProperties(8);
  const landsPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'land'), Query.limit(1)]).catch(() => ({ total: 0 }));
  const housesPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'house'), Query.limit(1)]).catch(() => ({ total: 0 }));
  const apartmentsPromise = databases.listDocuments(DB_ID, COLLECTION_LISTINGS, [Query.equal('category_id', 'apartment'), Query.limit(1)]).catch(() => ({ total: 0 }));

  const [featuredProperties, landsRes, housesRes, apartmentsRes] = await Promise.all([
    propertiesPromise,
    landsPromise,
    housesPromise,
    apartmentsPromise
  ]);

  const categoryCounts = {
    lands: landsRes.total,
    houses: housesRes.total,
    apartments: apartmentsRes.total
  };

  const categories = [
    { name: 'Lands', icon: Trees, href: '/properties?type=land', count: categoryCounts.lands, color: 'bg-green-50 text-green-600' },
    { name: 'Houses', icon: Home, href: '/properties?type=sale', count: categoryCounts.houses, color: 'bg-blue-50 text-blue-600' },
    { name: 'Apartments', icon: Building, href: '/properties?type=apartment', count: categoryCounts.apartments, color: 'bg-purple-50 text-purple-600' },
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((property, idx) => (
                <div
                  key={property.$id || idx}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
                // Empty state or skeleton could go here, but for SSR usually we just show nothing or a message
                <div className="col-span-4 text-center py-12 text-slate-500">
                    No featured properties found at the moment.
                </div>
            )}
          </div>
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
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
