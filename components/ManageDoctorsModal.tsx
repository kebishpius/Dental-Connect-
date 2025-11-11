import React from 'react';
import type { Doctor } from '../types';
import { StethoscopeIcon, CloseIcon } from './IconComponents';

interface ManageDoctorsModalProps {
  doctors: Doctor[];
  onClose: () => void;
  onDoctorRemove: (doctorId: string) => void;
}

export const ManageDoctorsModal: React.FC<ManageDoctorsModalProps> = ({ doctors, onClose, onDoctorRemove }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <StethoscopeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Manage Doctors</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {doctors.length > 0 ? (
            <ul className="space-y-3">
              {doctors.map((doctor) => (
                <li key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <StethoscopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDoctorRemove(doctor.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>You haven't added any doctors yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
