export const AVERAGE_PRICES = {
    'Colombo': { land: 6000000, house_sqft: 28000, trend: 'up', growth: 12.5 },
    'Kandy': { land: 1800000, house_sqft: 16000, trend: 'stable', growth: 5.2 },
    'Galle': { land: 1500000, house_sqft: 20000, trend: 'up', growth: 15.8 }, // Tourism boom
    'Gampaha': { land: 900000, house_sqft: 13000, trend: 'stable', growth: 4.1 },
    'Negombo': { land: 1200000, house_sqft: 15000, trend: 'up', growth: 8.5 },
    'Malabe': { land: 1800000, house_sqft: 18000, trend: 'up', growth: 22.0 }, // Tech city impact
    'Nugegoda': { land: 3500000, house_sqft: 22000, trend: 'up', growth: 10.5 },
    'Battaramulla': { land: 3000000, house_sqft: 24000, trend: 'up', growth: 11.2 },
    'Dehiwala': { land: 4000000, house_sqft: 20000, trend: 'stable', growth: 6.0 },
    'default': { land: 500000, house_sqft: 8000, trend: 'stable', growth: 3.5 }
};

/**
 * Estimate property value based on market data.
 * @param {Object} property 
 */
export function estimateValue(property) {
    let locStr = 'default';
    if (typeof property.location === 'string') locStr = property.location;
    else if (property.location?.city) locStr = property.location.city;

    const locationKey = Object.keys(AVERAGE_PRICES).find(c => locStr.includes(c)) || 'default';
    const rates = AVERAGE_PRICES[locationKey];

    let estimatedPrice = 0;
    const isLand = property.listing_type === 'sale' && property.category_id === 'land'; // robust check needed based on real data
    const perches = property.perch_size || property.specs?.perch_size || 10;

    if (property.category_id === 'land' || (!property.size_sqft && !property.area)) {
        // Land Valuation
        estimatedPrice = perches * rates.land;
    } else {
        // House Valuation
        const sqft = property.size_sqft || property.area || 2000;
        estimatedPrice = sqft * rates.house_sqft;

        // Adjust for land value too if specified
        if (perches) {
            estimatedPrice += (perches * rates.land * 0.5); // Discounted land value for built property
        }
    }

    // Adjustments
    if (property.beds) estimatedPrice *= (1 + (property.beds * 0.05));
    if (property.baths) estimatedPrice *= (1 + (property.baths * 0.03));
    if (property.pool) estimatedPrice *= 1.15;

    // Range (+/- 10%)
    return {
        low: Math.floor(estimatedPrice * 0.9),
        high: Math.floor(estimatedPrice * 1.1),
        confidence: locationKey === 'default' ? 'Low' : 'High',
        locationMatch: locationKey
    };
}

/**
 * Predict market trend for a location
 * @param {string} location
 */
export function predictTrend(location) {
    let locStr = 'default';
    if (typeof location === 'string') locStr = location;

    const locationKey = Object.keys(AVERAGE_PRICES).find(c => locStr.includes(c)) || 'default';
    return AVERAGE_PRICES[locationKey];
}
