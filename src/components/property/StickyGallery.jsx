'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Globe, Banknote, Heart, Loader2 } from 'lucide-react';

export function StickyGallery({ images, property, isSaved, onSave, savingFav, activeImage, setActiveImage }) {

    const handleNext = () => {
        setActiveImage((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-slate-200 h-[400px] lg:h-[500px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={images[activeImage] || '/placeholder.jpg'}
                        alt={property?.title || "Property Image"}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                </motion.div>
            </AnimatePresence>

            {/* Overlays */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm">
                    {property?.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                {property?.is_foreign_eligible && (
                    <span className="bg-blue-500/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Foreign Eligible
                    </span>
                )}
                {property?.has_payment_plan && (
                    <span className="bg-amber-500/90 backdrop-blur-md text-white px-3 py-1 text-sm font-bold rounded-lg shadow-sm flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Payment Plan
                    </span>
                )}
            </div>

            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={onSave}
                    disabled={savingFav}
                    className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white'}`}
                >
                    {savingFav ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
                </button>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
