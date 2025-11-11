import React from 'react';
import type { UserRole } from '../types';
import { StethoscopeIcon, UserIcon } from './IconComponents';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const activeClass = "bg-white text-blue-600 shadow-md";
  const inactiveClass = "bg-transparent text-white hover:bg-white/20";
  
  return (
    <header className="bg-blue-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full">
                <StethoscopeIcon className="h-6 w-6 text-blue-600"/>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">DentalConnect</h1>
        </div>
        <div className="flex items-center bg-blue-500 rounded-full p-1 space-x-1">
          <button
            onClick={() => onRoleChange('patient')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${currentRole === 'patient' ? activeClass : inactiveClass}`}
          >
            <UserIcon className="h-5 w-5"/>
            <span>Patient</span>
          </button>
          <button
            onClick={() => onRoleChange('dentist')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${currentRole === 'dentist' ? activeClass : inactiveClass}`}
          >
             <StethoscopeIcon className="h-5 w-5"/>
             <span>Dentist</span>
          </button>
        </div>
      </div>
    </header>
  );
};
