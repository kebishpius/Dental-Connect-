
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
    return (
        <div className={`bg-gradient-to-br ${color} text-white p-6 rounded-lg shadow-lg`}>
            <div className="flex justify-between items-start">
                 <h3 className="text-lg font-semibold">{title}</h3>
                 <div className="bg-white/30 p-2 rounded-full">
                    {icon}
                 </div>
            </div>
            <p className="text-5xl font-bold mt-4">{value}</p>
            <p className="opacity-80 mt-1">{subtitle}</p>
        </div>
    );
};
