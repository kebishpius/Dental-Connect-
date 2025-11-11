import React, { useState } from 'react';
import { parseAppointment } from '../services/geminiService';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, CalendarIcon, CloseIcon, CheckCircleIcon } from './IconComponents';
import type { Appointment } from '../types';

interface AddAppointmentModalProps {
  onClose: () => void;
  onAppointmentAdd: (appointment: Appointment) => void;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ onClose, onAppointmentAdd }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Appointment | null>(null);

  const handleParse = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setParsedData(null);
    try {
      const newAppointment = await parseAppointment(text);
      setParsedData(newAppointment);
    } catch (err) {
      setError(err instanceof Error ? `Could not understand the appointment details. Please be more specific. Error: ${err.message}` : 'Could not schedule appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onAppointmentAdd(parsedData);
      onClose();
    }
  };

  const handleEdit = () => {
    setParsedData(null);
    setError(null);
  };
  
  const renderInputView = () => (
     <div className="p-6">
        <label htmlFor="appointment-text" className="font-semibold text-slate-700 mb-2 block">
          Describe the appointment
        </label>
        <p className="text-sm text-slate-500 mb-2">
            Use natural language. The AI will understand.
        </p>
        <ul className="text-xs text-slate-500 list-disc list-inside mb-4 space-y-1">
            <li>"Book a cleaning with Dr. Chen for next Tuesday at 2pm."</li>
            <li>"Follow-up with Jane Doe on June 15th at 10:30 AM."</li>
        </ul>
        <textarea
          id="appointment-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter details here..."
          className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          rows={3}
          disabled={isLoading}
        />

        {isLoading && <div className="mt-4 flex justify-center"><Spinner /></div>}
        
        {error && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-sm flex items-start">
            <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end items-center mt-6 space-x-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleParse}
            disabled={isLoading || !text.trim()} 
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-400"
          >
            {isLoading ? 'Parsing...' : 'Schedule with AI'}
          </button>
        </div>
      </div>
  );

  const renderConfirmationView = () => (
    parsedData && (
        <div className="p-6">
             <div className="text-center mb-4">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <h4 className="text-xl font-bold text-slate-800">Please Confirm Details</h4>
                <p className="text-slate-500">The AI has parsed the following information.</p>
             </div>
             <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                <div>
                    <label className="text-xs font-semibold text-slate-500">TITLE</label>
                    <p className="font-medium text-slate-800">{parsedData.title}</p>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500">WITH</label>
                    <p className="font-medium text-slate-800">{parsedData.doctor}</p>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500">DATE & TIME</label>
                    <p className="font-medium text-slate-800">{new Date(parsedData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} at {parsedData.time}</p>
                </div>
             </div>
             <div className="flex justify-end items-center mt-6 space-x-3">
                <button type="button" onClick={handleEdit} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Edit
                </button>
                <button 
                    type="button" 
                    onClick={handleConfirm}
                    className="px-6 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                    Confirm Appointment
                </button>
            </div>
        </div>
    )
  );


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
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">Add New Appointment</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        {parsedData ? renderConfirmationView() : renderInputView()}
      </div>
    </div>
  );
};