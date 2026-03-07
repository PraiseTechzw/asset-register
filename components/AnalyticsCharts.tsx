"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const DepreciationArea = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
            <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--border)" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="var(--border)" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
            <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                itemStyle={{ color: '#3b82f6' }}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
        </AreaChart>
    </ResponsiveContainer>
);

export const ReplacementBar = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" stroke="var(--border)" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
            <YAxis dataKey="category" type="category" stroke="var(--border)" tick={{ fill: '#9ca3af' }} width={80} />
            <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                cursor={{ fill: 'var(--border)' }}
            />
            <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={32} />
        </BarChart>
    </ResponsiveContainer>
);

// No default export of object, just use the named exports
