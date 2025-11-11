import React from 'react';
import type { User } from '../types';
import { CheckIcon, UserCircleIcon, ChevronRightIcon } from './IconComponents';

interface ProfileCardProps {
  user: User;
  onEditProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditProfile }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <UserCircleIcon className="h-16 w-16 text-slate-300" />
            <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" title="Online"></span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h2>
            <p className="text-gray-500">Let's check on your dental health today.</p>
          </div>
        </div>
        <button 
          onClick={onEditProfile}
          className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors self-start sm:self-center"
        >
          <span>Profile Settings</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};