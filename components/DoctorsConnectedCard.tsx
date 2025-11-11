import React from 'react';
import type { User } from '../types';
import { ChevronRightIcon, StethoscopeIcon } from './IconComponents';

interface DoctorsConnectedCardProps {
  connectedDentists: User[];
  onFindDoctor: () => void;
}

export const DoctorsConnectedCard: React.FC<DoctorsConnectedCardProps> = ({ connectedDentists, onFindDoctor }) => {
  const displayedDoctors = connectedDentists.slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Doctors Connected</h3>
      </div>

      {displayedDoctors.length > 0 ? (
        <ul className="space-y-3">
          {displayedDoctors.map((doctor) => (
            <li key={doctor.id} className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <StethoscopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">{doctor.name}</p>
                <p className="text-sm text-gray-500">{doctor.specialty || 'Dentist'}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p>No doctors connected yet.</p>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <button onClick={onFindDoctor} className="w-full flex justify-between items-center text-blue-600 font-semibold hover:underline">
          <span>Find & Connect with a Doctor</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};