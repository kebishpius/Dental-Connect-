import React from 'react';
import type { User } from '../types';
import { CheckIcon, UserCircleIcon } from './IconComponents';

interface ProfileCardProps {
  user: User;
  onEditProfile: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditProfile }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-100 p-4 rounded-full">
            <UserCircleIcon className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h2>
            <p className="text-gray-500">Let's check on your dental health today.</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={onEditProfile}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
       <div className="mt-4 pt-4 border-t flex items-center space-x-2 text-green-600">
            <CheckIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Profile is up-to-date</span>
        </div>
    </div>
  );
};
