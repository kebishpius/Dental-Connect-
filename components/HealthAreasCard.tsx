import React from 'react';
import type { HealthArea } from '../types';
import { ArrowUpRightIcon, CheckIcon, DentalIcon, InfoIcon } from './IconComponents';

interface HealthAreasCardProps {
  healthAreas: HealthArea[];
}

const HealthIcon: React.FC<{ status: HealthArea['status'] }> = ({ status }) => {
    const isGood = status === 'Good';
    const bgColor = isGood ? 'bg-green-100' : 'bg-yellow-100';
    const textColor = isGood ? 'text-green-600' : 'text-yellow-600';
    return (
        <div className={`p-2 rounded-full ${bgColor} ${textColor}`}>
            {isGood ? <CheckIcon className="h-5 w-5" /> : <DentalIcon className="h-5 w-5" />}
        </div>
    );
};

export const HealthAreasCard: React.FC<HealthAreasCardProps> = ({ healthAreas }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Health Focus Areas</h3>
      {healthAreas.length > 0 ? (
        <ul className="space-y-3">
            {healthAreas.map((area, index) => (
            <li key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <HealthIcon status={area.status} />
                    <div>
                        <p className="font-semibold text-gray-700">{area.name}</p>
                        <p className={`text-sm ${area.status === 'Good' ? 'text-green-600' : 'text-yellow-700'}`}>{area.status}</p>
                    </div>
                </div>
                <ArrowUpRightIcon className="h-5 w-5 text-gray-400" />
            </li>
            ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-4 bg-slate-50 rounded-lg">
            <InfoIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Health insights from your dentist will appear here after a check-up.</p>
        </div>
      )}
    </div>
  );
};