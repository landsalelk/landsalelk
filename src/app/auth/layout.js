import CookieConsent from '@/components/ui/CookieConsent';

export default function AuthLayout({ children }) {
    return (
        <>
            {/* Auth pages have their own full-screen layout without navbar/footer */}
            {/* Toaster is already provided by root layout */}
            <main className="relative z-10 -mt-24">
                {children}
            </main>
            <CookieConsent />
        </>
    );
}
