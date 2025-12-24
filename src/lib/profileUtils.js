export const calculateProfileCompleteness = (agent) => {
    if (!agent) return 0;

    let score = 0;
    const totalWeight = 100;

    // Weighted Criteria
    const criteria = [
        { field: 'name', weight: 10 },
        { field: 'email', weight: 10 },
        { field: 'phone', weight: 10 },
        { field: 'bio', weight: 15 },
        { field: 'avatar', weight: 15 },
        { field: 'service_areas', weight: 10 }, // Assuming array or non-empty string
        { field: 'specializations', weight: 10 }, // Assuming array or non-empty string
        { field: 'license_number', weight: 10 },
        { field: 'social_links', weight: 10 }
    ];

    criteria.forEach(c => {
        const val = agent[c.field];
        let satisfied = false;

        if (Array.isArray(val)) {
            satisfied = val.length > 0;
        } else if (typeof val === 'string') {
            satisfied = val.trim().length > 0;
        } else if (val) {
            satisfied = true;
        }

        if (satisfied) score += c.weight;
    });

    return Math.min(score, 100);
};

export const getMissingFields = (agent) => {
    if (!agent) return [];

    const fields = [
        { key: 'bio', label: 'Biography' },
        { key: 'avatar', label: 'Profile Picture' },
        { key: 'service_areas', label: 'Service Areas' },
        { key: 'specializations', label: 'Specializations' },
        { key: 'license_number', label: 'License Number' },
        { key: 'social_links', label: 'Social Media Links' }
    ];

    return fields.filter(f => {
        const val = agent[f.key];
        if (Array.isArray(val)) return val.length === 0;
        return !val || (typeof val === 'string' && val.trim() === '');
    });
};
