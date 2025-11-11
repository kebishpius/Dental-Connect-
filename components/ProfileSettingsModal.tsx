import React, { useState } from 'react';
import type { User } from '../types';
import { UserCircleIcon, CloseIcon } from './IconComponents';

interface ProfileSettingsModalProps {
  user: User;
  onClose: () => void;
  onProfileUpdate: (user: User) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onClose, onProfileUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate({ ...user, name, email, address });
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Profile Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="profile-name" className="font-semibold text-slate-700 mb-1 block">Full Name</label>
            <input
              id="profile-name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" required
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="font-semibold text-slate-700 mb-1 block">Email Address</label>
            <input
              id="profile-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" required
            />
          </div>
           <div>
            <label htmlFor="profile-address" className="font-semibold text-slate-700 mb-1 block">Address</label>
            <input
              id="profile-address" type="text" value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end items-center pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
