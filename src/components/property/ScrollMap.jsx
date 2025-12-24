'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MapPin } from 'lucide-react';

export function ScrollMap({ location }) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]);

    // Use a static map placeholder or embed if we had an API key.
    // For now, we will use an iframe embed for the location string.
    const encodedLocation = encodeURIComponent(location || "Colombo");
    const mapUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return (
        <div ref={containerRef} className="w-full py-8 overflow-hidden">
             <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900">Location Map</h3>
            </div>

            <motion.div
                style={{ scale, opacity }}
                className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-slate-200"
            >
                <iframe
                    width="100%"
                    height="100%"
                    src={mapUrl}
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    title="Property Location"
                    className="w-full h-full"
                ></iframe>

                {/* Overlay to prevent scroll capture until clicked (optional UX improvement) */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-3xl"></div>
            </motion.div>
             <p className="mt-4 text-xs text-slate-400 text-center">
                Map view zooms in as you scroll. Location is approximate.
            </p>
        </div>
    );
}
