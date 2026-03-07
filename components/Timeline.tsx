import React from 'react';

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    date?: string;
    time?: string;
    status: 'completed' | 'current' | 'pending' | 'failed';
}

interface TimelineProps {
    events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
    return (
        <div className="relative border-l border-[var(--border)] ml-3 py-2 space-y-6">
            {events.map((event) => (
                <div key={event.id} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${event.status === 'completed' ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                            event.status === 'current' ? 'bg-[var(--background)] border-blue-500 animate-pulse' :
                                event.status === 'failed' ? 'bg-rose-500 border-rose-500' :
                                    'bg-[var(--background)] border-gray-600'
                        }`} />

                    <div className="flex flex-col">
                        <span className="text-xs font-mono text-gray-500 mb-1">{event.date || event.time}</span>
                        <h5 className={`text-sm font-semibold mb-1 ${event.status === 'pending' ? 'text-gray-500' : 'text-[var(--foreground)]'}`}>
                            {event.title}
                        </h5>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;

