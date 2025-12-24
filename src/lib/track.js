export function track(event, props) {
    try {
        if (typeof window === 'undefined') return;

        const payload = props && typeof props === 'object' ? props : undefined;

        if (typeof window.posthog?.capture === 'function') {
            window.posthog.capture(event, payload);
            return;
        }

        if (typeof window.gtag === 'function') {
            window.gtag('event', event, payload);
            return;
        }

        if (typeof window.analytics?.track === 'function') {
            window.analytics.track(event, payload);
            return;
        }

        if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
            console.debug('[track]', event, payload);
        }
    } catch {
        return;
    }
}
