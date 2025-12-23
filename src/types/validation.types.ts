import { z } from 'zod';

// Schema for contacting an agent/owner to prevent spam and bad data
export const ContactSchema = z.object({
    listingId: z.string().min(1, "Invalid Listing"),
    message: z.string().min(10, "Message too short (min 10 chars)").max(500, "Message too long"),
    phone: z.string().regex(/^\+94[0-9]{9}$/, "Invalid Sri Lankan Phone Number (+947...)")
});

// Schema for search to prevent empty queries
export const SearchSchema = z.object({
    location: z.string().optional(),
    type: z.enum(["rent", "buy"]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
});
