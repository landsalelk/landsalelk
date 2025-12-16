'use client';

import { useState } from 'react';
import { getFilterOptions } from '@/lib/properties';
import { Search, Filter, X } from 'lucide-react';

export function PropertyFilters({ filters, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const options = getFilterOptions();

    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <>
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700 font-medium mb-4"
            >
                <Filter className="w-4 h-4" /> Filters
            </button>

            {/* Filter Sidebar / Panel */}
            <div className={`
        fixed inset-0 z-40 bg-black/50 md:static md:bg-transparent md:z-0
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full md:h-auto overflow-y-auto w-80 md:w-full fixed md:static right-0 top-0 transition-transform duration-300">

                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h3 className="font-bold text-lg">Filters</h3>
                        <button onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-6">

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Keyword</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Colombo, Sea View"
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                                    value={filters.search || ''}
                                    onChange={(e) => handleChange('search', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Listing Type</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {(['all', ...options.types]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleChange('type', type === 'all' ? '' : type)}
                                        className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors capitalize ${(filters.type === type || (!filters.type && type === 'all'))
                                                ? 'bg-white shadow-sm text-emerald-700'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {type === 'all' ? 'Any' : type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Price Range (LKR)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    onChange={(e) => handleChange('minPrice', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                onChange={(e) => handleChange('category', e.target.value)}
                                value={filters.category || 'all'}
                            >
                                <option value="all">All Categories</option>
                                {options.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* SL Specifics: Deed Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Deed Type</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                onChange={(e) => handleChange('deedType', e.target.value)}
                                value={filters.deedType || 'any'}
                            >
                                <option value="any">Any Deed</option>
                                {options.deedTypes.map(dt => (
                                    <option key={dt} value={dt}>{dt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={filters.nbro || false}
                                    onChange={(e) => handleChange('nbro', e.target.checked)}
                                />
                                <span className="text-sm text-slate-600">NBRO Approved Only</span>
                            </label>
                        </div>

                        <button
                            onClick={() => onChange({})}
                            className="w-full py-2 text-sm text-slate-500 hover:text-red-500 font-medium transition-colors"
                        >
                            Reset Filters
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}
