'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

/**
 * FacebookPixel component handles the integration of the Facebook Pixel script.
 * It tracks 'PageView' events on initial load and subsequent client-side navigations.
 * This component manages the script loading state to prevent race conditions and
 * includes error handling for both script loading and event tracking.
 * @returns {JSX.Element|null} The Facebook Pixel script and noscript tag, or null if the pixel ID is not configured.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // This effect tracks PageView events. It depends on `isScriptLoaded` to ensure
    // that `window.fbq` is available and initialized before tracking is attempted.
    if (!facebookPixelId || !isScriptLoaded) return;

    // Guard against execution in non-browser environments.
    if (typeof window === 'undefined') return;

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch (error) {
      // Catch runtime errors from the Facebook SDK to prevent app crashes.
      console.error('Facebook Pixel tracking error:', error);
    }
  }, [pathname, searchParams, facebookPixelId, isScriptLoaded]);

  if (!facebookPixelId) return null;

  return (
    <>
      <Script
        id="facebook-pixel"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => {
          // The script has loaded, now we can initialize the pixel.
          if (typeof window.fbq === 'function') {
            window.fbq('init', facebookPixelId);
            setIsScriptLoaded(true);
          }
        }}
        onError={(e) => {
          console.error('Facebook Pixel script failed to load:', e);
        }}
      />
      <noscript>
        {/* Standard img tag for the noscript fallback for tracking pixels. */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
}
