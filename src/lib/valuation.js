export const AVERAGE_PRICES = {
    'Colombo': { land: 5000000, house_sqft: 25000 },
    'Kandy': { land: 1500000, house_sqft: 15000 },
    'Galle': { land: 1200000, house_sqft: 18000 },
    'Gampaha': { land: 800000, house_sqft: 12000 },
    'Negombo': { land: 1000000, house_sqft: 14000 },
    // Defaults
    'default': { land: 500000, house_sqft: 8000 }
};

/**
 * Estimate property value based on market data.
 * @param {Object} property 
 */
export function estimateValue(property) {
    const location = Object.keys(AVERAGE_PRICES).find(c => property.location?.includes(c)) || 'default';
    const rates = AVERAGE_PRICES[location];

    let estimatedPrice = 0;

    if (property.listing_type === 'Land' || !property.size_sqft) {
        // Land Valuation
        const perches = property.perch_size || 10;
        estimatedPrice = perches * rates.land;
    } else {
        // House Valuation
        const sqft = property.size_sqft || 2000;
        estimatedPrice = sqft * rates.house_sqft;

        // Adjust for land value too if specified
        if (property.perch_size) {
            estimatedPrice += (property.perch_size * rates.land * 0.5); // Discounted land value for built property
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
        confidence: location === 'default' ? 'Low' : 'High'
    };
}
