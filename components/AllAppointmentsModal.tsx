import React from 'react';
import type { Appointment } from '../types';
import { CalendarIcon, CloseIcon } from './IconComponents';

interface AllAppointmentsModalProps {
  appointments: Appointment[];
  onClose: () => void;
}

export const AllAppointmentsModal: React.FC<AllAppointmentsModalProps> = ({ appointments, onClose }) => {
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
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">All Appointments</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((apt) => (
                <li key={apt.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{apt.title}</p>
                    <p className="text-sm text-gray-600">{apt.doctor}</p>
                    <p className="text-sm text-gray-500">{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {apt.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center text-gray-500 py-8">
                <p>You have no appointments scheduled.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
