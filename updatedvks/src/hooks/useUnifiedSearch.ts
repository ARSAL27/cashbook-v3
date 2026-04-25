import { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { fuzzySearch } from '../services/searchService';

export type UnifiedItem = {
    id: string;
    name: string;
    type: 'product' | 'supplier' | 'customer';
    subtext?: string;
    original: any;
};

/**
 * 🔗 Unified Search Hook
 * Combines stock (products) and contacts (suppliers/customers) 
 * into a single searchable stream as per the new Database Schema.
 */
export const useUnifiedSearch = (searchTerm: string) => {
    const { stock, contacts } = useShop();

    const unifiedList = useMemo(() => {
        const products: UnifiedItem[] = stock.map(s => ({
            id: s.id,
            name: s.name,
            type: 'product',
            subtext: `Stock: ${s.quantity} ${s.unit} • Rs. ${s.price}`,
            original: s
        }));

        const people: UnifiedItem[] = contacts.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type, // 'supplier' or 'customer'
            subtext: `${c.phone || 'No Phone'} • ${c.type.toUpperCase()}`,
            original: c
        }));

        return [...products, ...people];
    }, [stock, contacts]);

    const results = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return fuzzySearch(searchTerm, unifiedList, ['name', 'type'], 15);
    }, [searchTerm, unifiedList]);

    return results;
};
