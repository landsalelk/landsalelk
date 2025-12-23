'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';

/**
 * FacebookPixel component handles the Facebook Pixel script injection and page view tracking.
 * It dynamically loads the Facebook Pixel script and tracks page views on navigation.
 * Includes a noscript fallback for browsers with JavaScript disabled.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    try {
      if (facebookPixelId && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch (error) {
      // Silently fail to avoid crashing the app
    }
  }, [pathname, searchParams, facebookPixelId]);

  if (!facebookPixelId) return null;

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
        <Image
          height={1}
          width={1}
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  );
}
