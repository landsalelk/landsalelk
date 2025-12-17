'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const META_PIXEL_ID = '1105077424748697';

// Utility functions for tracking events
declare global {
    interface Window {
        fbq: (...args: unknown[]) => void;
    }
}

// Track standard events
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, params);
    }
};

// Track custom events
export const trackCustomEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, params);
    }
};

// Track PageView on route changes (for SPA navigation)
function RouteChangeTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track PageView on route change
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'PageView');
        }
    }, [pathname, searchParams]);

    return null;
}

export function MetaPixel() {
    return (
        <>
            <Script
                id="meta-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
            <Suspense fallback={null}>
                <RouteChangeTracker />
            </Suspense>
        </>
    );
}

// Standard Meta Pixel events for real estate
export const pixelEvents = {
    // When user views a property listing
    viewProperty: (propertyId: string, propertyName: string, price?: number) => {
        trackEvent('ViewContent', {
            content_type: 'property',
            content_ids: [propertyId],
            content_name: propertyName,
            value: price,
            currency: 'LKR',
        });
    },

    // When user searches for properties
    search: (searchQuery: string, location?: string, filters?: Record<string, unknown>) => {
        trackEvent('Search', {
            search_string: searchQuery,
            content_category: location || 'all',
            content_type: 'property',
            ...filters,
        });
    },

    // When user submits an inquiry/lead form
    submitLead: (propertyId?: string, propertyTitle?: string) => {
        trackEvent('Lead', {
            content_type: 'property_inquiry',
            content_ids: propertyId ? [propertyId] : undefined,
            content_name: propertyTitle,
        });
    },

    // When user contacts an agent
    contact: (agentId?: string, method?: 'call' | 'whatsapp' | 'email') => {
        trackEvent('Contact', {
            content_type: 'agent_contact',
            content_ids: agentId ? [agentId] : undefined,
            contact_method: method,
        });
    },

    // When user adds property to favorites
    addToWishlist: (propertyId: string, propertyName: string, price?: number) => {
        trackEvent('AddToWishlist', {
            content_type: 'property',
            content_ids: [propertyId],
            content_name: propertyName,
            value: price,
            currency: 'LKR',
        });
    },

    // When user completes registration
    completeRegistration: (method?: 'google' | 'email') => {
        trackEvent('CompleteRegistration', {
            status: true,
            registration_method: method,
        });
    },

    // When user starts checkout (boost/subscription)
    initiateCheckout: (planId: string, planName: string, value: number) => {
        trackEvent('InitiateCheckout', {
            content_type: 'subscription',
            content_ids: [planId],
            content_name: planName,
            value: value,
            currency: 'LKR',
            num_items: 1,
        });
    },

    // When purchase is completed
    purchase: (orderId: string, productName: string, value: number, productType: 'boost' | 'subscription' | 'digital_product') => {
        trackEvent('Purchase', {
            content_type: productType,
            content_ids: [orderId],
            content_name: productName,
            value: value,
            currency: 'LKR',
            num_items: 1,
        });
    },

    // Custom: When user views agent profile
    viewAgentProfile: (agentId: string, agentName: string) => {
        trackCustomEvent('ViewAgentProfile', {
            agent_id: agentId,
            agent_name: agentName,
        });
    },

    // Custom: When user saves a search
    saveSearch: (searchName: string, filters: Record<string, unknown>) => {
        trackCustomEvent('SaveSearch', {
            search_name: searchName,
            ...filters,
        });
    },

    // Custom: When user uses ROI calculator
    useROICalculator: (propertyId: string, calculatedROI?: number) => {
        trackCustomEvent('UseROICalculator', {
            property_id: propertyId,
            calculated_roi: calculatedROI,
        });
    },

    // Custom: Property card click (micro-conversion)
    propertyCardClick: (propertyId: string, propertyName: string, source: 'search' | 'home' | 'similar') => {
        trackCustomEvent('PropertyCardClick', {
            property_id: propertyId,
            property_name: propertyName,
            source: source,
        });
    },
};
