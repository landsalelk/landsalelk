'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

/**
 * FacebookPixel component injects the Facebook Pixel script into the application.
 * It tracks page views on initial load and subsequent client-side navigations.
 * The component will return null and not render the script if the
 * NEXT_PUBLIC_FACEBOOK_PIXEL_ID environment variable is not set.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  // If the Facebook Pixel ID is not configured, do not render the component.
  if (!facebookPixelId) {
    return null;
  }

  useEffect(() => {
    // This effect runs on mount and whenever pathname/searchParams change.
    // It ensures PageView is tracked on initial load and client-side navigation.
    // The `facebookPixelId` check above ensures `window.fbq` will be defined.
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

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
