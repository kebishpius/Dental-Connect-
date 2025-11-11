import React from 'react';
import type { User } from '../types';
import { CloseIcon, StethoscopeIcon } from './IconComponents';

interface FindDentistModalProps {
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onUpdateUsers: (updatedUsers: User[]) => void;
}

export const FindDentistModal: React.FC<FindDentistModalProps> = ({ currentUser, allUsers, onClose, onUpdateUsers }) => {
  const dentists = allUsers.filter(u => u.role === 'dentist');

  const handleSendRequest = (dentist: User) => {
    // Optimistically update the patient to show "Request Sent" immediately
    const updatedPatient: User = {
      ...currentUser,
      sentConnectionRequests: [...(currentUser.sentConnectionRequests || []), dentist.id],
    };

    // Update the dentist to add the new pending connection
    const updatedDentist: User = {
      ...dentist,
      pendingConnections: [
        ...(dentist.pendingConnections || []),
        { patientId: currentUser.id, patientName: currentUser.name },
      ],
    };
    
    // Update state for both users
    onUpdateUsers([updatedPatient, updatedDentist]);
  };

  const getButtonState = (dentist: User) => {
    if (currentUser.connectedDentistIds?.includes(dentist.id)) {
      return { text: 'Connected', disabled: true, className: 'bg-green-500 text-white cursor-default' };
    }
    if (currentUser.sentConnectionRequests?.includes(dentist.id)) {
      return { text: 'Request Sent', disabled: true, className: 'bg-slate-400 text-white cursor-default' };
    }
    return { text: 'Connect', disabled: false, className: 'bg-blue-600 text-white hover:bg-blue-700' };
  };

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
            <h3 className="text-lg font-bold text-slate-800">Find a Dentist</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {dentists.length > 0 ? (
            <ul className="space-y-3">
              {dentists.map(dentist => {
                const buttonState = getButtonState(dentist);
                return (
                  <li key={dentist.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div>
                        <p className="font-semibold text-gray-800">{dentist.name}</p>
                        <p className="text-sm text-gray-500">{dentist.specialty || 'Dentist'}</p>
                    </div>
                    <button
                        onClick={() => handleSendRequest(dentist)}
                        disabled={buttonState.disabled}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${buttonState.className}`}
                    >
                        {buttonState.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No dentists are currently registered on the platform.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};