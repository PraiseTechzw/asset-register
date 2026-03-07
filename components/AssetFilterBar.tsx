"use client";

import { Search, Filter } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function AssetFilterBar({ categories }: { categories: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(searchParams.get('q') || '');

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-4 items-center border border-[var(--border)] bg-[var(--background)]">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--foreground)]"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        updateFilters('q', e.target.value);
                    }}
                />
            </div>
            <select
                className="bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2 px-4 text-sm focus:outline-none min-w-[140px] text-[var(--foreground)]"
                onChange={(e) => updateFilters('category', e.target.value)}
                defaultValue={searchParams.get('category') || ''}
            >
                <option value="">All Categories</option>
                {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <select
                className="bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2 px-4 text-sm focus:outline-none min-w-[140px] text-[var(--foreground)]"
                onChange={(e) => updateFilters('status', e.target.value)}
                defaultValue={searchParams.get('status') || ''}
            >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="MISSING">Missing</option>
                <option value="SCRAP">Scrap</option>
            </select>
            <div className={`transition-opacity ${isPending ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
}
