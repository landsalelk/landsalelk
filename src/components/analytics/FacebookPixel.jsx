'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

/**
 * FacebookPixel component handles the injection of the Facebook Pixel tracking script.
 * It tracks page views on initial load and client-side navigation.
 *
 * This component uses `dangerouslySetInnerHTML` to inject the Facebook Pixel script
 * as provided by Facebook's official documentation. This is a standard practice
 * for third-party scripts that require this specific implementation.
 *
 * The `noscript` tag with an `img` element is a fallback for browsers with
 * JavaScript disabled, ensuring that page views can still be tracked.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    // This effect runs on mount and whenever pathname/searchParams change.
    // It ensures PageView is tracked on initial load and client-side navigation.
    if (facebookPixelId && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, facebookPixelId]);

  if (!facebookPixelId) {
    console.warn("Facebook Pixel ID is not configured. Tracking will be disabled.");
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
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
            fbq('init', '${facebookPixelId}');
            // 'PageView' tracking is handled by the useEffect hook
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
