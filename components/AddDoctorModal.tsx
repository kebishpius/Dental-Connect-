import React, { useState } from 'react';
import type { Doctor } from '../types';
import { StethoscopeIcon, CloseIcon } from './IconComponents';

interface AddDoctorModalProps {
  onClose: () => void;
  onDoctorAdd: (doctor: Omit<Doctor, 'id' | 'avatarUrl'>) => void;
}

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ onClose, onDoctorAdd }) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialty.trim()) return;

    onDoctorAdd({
      name,
      specialty,
    });
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
            <StethoscopeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Add a Doctor</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="doctor-name" className="font-semibold text-slate-700 mb-1 block">
              Doctor's Name
            </label>
            <input
              id="doctor-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dr. Jane Smith"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="doctor-specialty" className="font-semibold text-slate-700 mb-1 block">
              Specialty
            </label>
            <input
              id="doctor-specialty"
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g., General Dentistry"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end items-center pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim() || !specialty.trim()}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
