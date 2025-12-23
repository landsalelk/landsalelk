'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';

/**
 * FacebookPixel component handles the integration of the Facebook Pixel script.
 * It tracks 'PageView' events on initial load and subsequent client-side navigations.
 * The component ensures the script and tracking calls only execute on the client-side
 * and includes error handling to prevent application crashes.
 * @returns {JSX.Element|null} The Facebook Pixel script and noscript tag, or null if the pixel ID is not configured.
 */
export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    // This effect runs on mount and on every route change to track PageView events.
    // The dependencies `pathname` and `searchParams` trigger the effect on navigation.
    if (!facebookPixelId) return;

    // Ensure this code only runs on the client where the `window` object is available.
    if (typeof window === 'undefined') return;

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch (error) {
      console.error('Facebook Pixel PageView track failed:', error);
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
