import React from 'react';
import type { Appointment } from '../types';
import { CalendarIcon, ChevronRightIcon, PlusIcon } from './IconComponents';

interface AppointmentsCardProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
  onViewAll: () => void;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Add timezone offset to prevent date from shifting
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const AppointmentsCard: React.FC<AppointmentsCardProps> = ({ appointments, onAddAppointment, onViewAll }) => {
  const upcomingAppointments = appointments.slice(0, 2);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
        <button 
          onClick={onAddAppointment}
          className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      
      {upcomingAppointments.length > 0 ? (
        <ul className="space-y-4 flex-1">
          {upcomingAppointments.map((apt) => (
            <li key={apt.id} className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex flex-col items-center justify-center w-16 text-center">
                  <span className="text-sm font-bold">{formatDate(apt.date).split(' ')[0]}</span>
                  <span className="text-xl font-extrabold">{formatDate(apt.date).split(' ')[1]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-700">{apt.title}</p>
                <p className="text-sm text-gray-500">{apt.doctor} at {apt.time}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-slate-50 rounded-lg p-4">
            <CalendarIcon className="h-10 w-10 mb-2 text-gray-400" />
            <p className="font-semibold">No upcoming appointments</p>
            <p className="text-sm">Add one to see it here.</p>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <button onClick={onViewAll} className="w-full flex justify-between items-center text-blue-600 font-semibold hover:underline">
          <span>View All Appointments</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
