import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatShortPrice(price, currency = 'LKR') {
    if (!price) return 'Price on Request';
    const numPrice = Number(price);
    if (isNaN(numPrice)) return price;

    if (numPrice >= 1000000) {
        const value = numPrice / 1000000;
        // Show up to 2 decimal places, but remove trailing zeros (e.g. 1.50 -> 1.5)
        const formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return `${currency} ${formatted} Million`;
    }

    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(numPrice);
}
