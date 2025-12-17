'use client';

import { useEffect } from 'react';
import { pixelEvents } from '@/components/analytics/MetaPixel';

interface PropertyViewTrackerProps {
    propertyId: string;
    propertyTitle: string;
    price?: number;
}

/**
 * Client component that tracks property view events via Meta Pixel
 * Add this to property detail pages to fire ViewContent on mount
 */
export function PropertyViewTracker({ propertyId, propertyTitle, price }: PropertyViewTrackerProps) {
    useEffect(() => {
        // Fire ViewContent event when property page loads
        pixelEvents.viewProperty(propertyId, propertyTitle, price);
    }, [propertyId, propertyTitle, price]);

    return null; // This component only handles tracking, no UI
}
