import React from 'react';

interface ProgressBarProps {
    label: string;
    value: number; // 0 to 100
    colorPrefix?: string; // e.g., 'blue', 'emerald', 'rose'
    showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, colorPrefix = 'blue', showValue = true }) => {
    // Map simple color names to Tailwind hex variants (rough approximation for inline styles)
    const colorMap: Record<string, string> = {
        blue: '#3b82f6',
        emerald: '#10b981',
        rose: '#f43f5e',
        amber: '#f59e0b',
        purple: '#8b5cf6'
    };

    const color = colorMap[colorPrefix] || colorMap['blue'];

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
                {showValue && <span className="text-xs font-mono text-gray-400">{Math.round(value)}%</span>}
            </div>
            <div className="h-2 w-full bg-[var(--accent)] rounded-full overflow-hidden border border-[var(--border)]">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${Math.min(Math.max(value, 0), 100)}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}80`
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
