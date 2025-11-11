import React, { useState, useEffect } from 'react';
import type { User, Patient } from '../types';
import { UserCircleIcon, ChevronRightIcon, SearchIcon } from './IconComponents';
import { PatientDetailView } from './PatientDetailView';

interface DentistDashboardProps {
  user: User;
  allUsers: User[];
  onUpdateUsers: (updatedUsers: User[]) => void;
}

export const DentistDashboard: React.FC<DentistDashboardProps> = ({ user, allUsers, onUpdateUsers }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const patients = user.patients || [];
  const pendingConnections = user.pendingConnections || [];

  // This effect ensures that if the user prop (the dentist) is updated from the parent,
  // the selectedPatient state is also updated with the fresh data. This prevents stale UI.
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatientRecord = user.patients?.find(p => p.id === selectedPatient.id);
      if (updatedPatientRecord) {
        setSelectedPatient(updatedPatientRecord);
      } else {
        // Patient might have been disconnected or data is inconsistent, fallback to list view.
        setSelectedPatient(null);
      }
    }
  }, [user]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = (patientId: string) => {
    // Find the full user object for the patient who sent the request.
    const patientUser = allUsers.find(u => u.id === patientId);
    if (!patientUser) return; // Exit if the patient isn't found.

    // 1. Create a new patient record to add to the dentist's list.
    const newPatient: Patient = {
        id: patientUser.id,
        name: patientUser.name,
        lastVisit: new Date().toISOString().split('T')[0], // Set last visit to today.
        analysisHistory: [], // Initialize with no history.
        appointments: [], // Initialize with no appointments.
    };

    // 2. Prepare the updated dentist user object.
    const updatedDentist: User = {
        ...user,
        // Add the new patient to the existing list.
        patients: [...(user.patients || []), newPatient],
        // Remove the request from the pending list.
        pendingConnections: user.pendingConnections?.filter(p => p.patientId !== patientId),
    };

    // 3. Prepare the updated patient user object.
    const updatedPatientUser: User = {
        ...patientUser,
        // Add the dentist's ID to the patient's connected list.
        connectedDentistIds: [...(patientUser.connectedDentistIds || []), user.id],
        // Remove the request from the patient's sent list.
        sentConnectionRequests: patientUser.sentConnectionRequests?.filter(id => id !== user.id),
    };

    // 4. Update the state for both users simultaneously.
    onUpdateUsers([updatedDentist, updatedPatientUser]);
  };

  const handleDeclineRequest = (patientId: string) => {
    // Find the full user object for the patient.
    const patientUser = allUsers.find(u => u.id === patientId);
    if (!patientUser) return;

    // 1. Prepare the updated dentist object.
    const updatedDentist: User = {
        ...user,
        // Simply remove the request from the pending list.
        pendingConnections: user.pendingConnections?.filter(p => p.patientId !== patientId),
    };

    // 2. Prepare the updated patient object.
    const updatedPatientUser: User = {
        ...patientUser,
        // Also remove the request from the patient's sent list so they can send another if they wish.
        sentConnectionRequests: patientUser.sentConnectionRequests?.filter(id => id !== user.id),
    };

    // 3. Update the state for both users.
    onUpdateUsers([updatedDentist, updatedPatientUser]);
  };

  const renderConnectionRequests = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Connection Requests</h2>
        {pendingConnections.length > 0 ? (
            <div className="space-y-3">
                {pendingConnections.map(req => (
                    <div key={req.patientId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                        <p className="font-semibold text-gray-800">{req.patientName}</p>
                        <div className="space-x-2">
                            <button onClick={() => handleAcceptRequest(req.patientId)} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Accept</button>
                            <button onClick={() => handleDeclineRequest(req.patientId)} className="px-3 py-1 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Decline</button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500 py-4">No pending requests.</p>
        )}
    </div>
  );

  if (selectedPatient) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PatientDetailView 
                patient={selectedPatient} 
                onBack={() => setSelectedPatient(null)}
                dentistUser={user}
                allUsers={allUsers}
                onUpdateUsers={onUpdateUsers}
            />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">You have {patients.length} patients in your list.</p>
        </div>

        {renderConnectionRequests()}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patient List</h2>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {filteredPatients.length > 0 ? (
                <div className="divide-y divide-gray-200">
                    {filteredPatients.map(patient => (
                        <div 
                            key={patient.id} 
                            className="flex justify-between items-center py-4 px-2 -mx-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPatient(patient)}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-slate-100 p-3 rounded-full">
                                    <UserCircleIcon className="h-8 w-8 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{patient.name}</p>
                                    <p className="text-sm text-gray-500">ID: {patient.id} &bull; Last Visit: {patient.lastVisit}</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">No patients found matching your search.</p>
            )}
        </div>
    </div>
  );
};