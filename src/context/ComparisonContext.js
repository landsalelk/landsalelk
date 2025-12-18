'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
    const [compareList, setCompareList] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (property) => {
        if (compareList.find(p => p.$id === property.$id)) {
            toast.info('Already in comparison list');
            return;
        }
        if (compareList.length >= 3) {
            toast.warning('You can compare up to 3 properties');
            return;
        }
        setCompareList(prev => [...prev, property]);
        toast.success('Added to comparison');
    };

    const removeFromCompare = (propertyId) => {
        setCompareList(prev => prev.filter(p => p.$id !== propertyId));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    return (
        <ComparisonContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    return useContext(ComparisonContext);
}
