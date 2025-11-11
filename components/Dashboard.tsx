import React, { useState } from 'react';
import type { User, AnalysisResult, Appointment, Doctor, HealthArea, PendingScan, PatientAnalysis } from '../types';
import { ImageUploader } from './ImageUploader';
import { ProfileCard } from './ProfileCard';
import { StatCard } from './StatCard';
import { CalendarIcon, DentalIcon, StethoscopeIcon, CheckCircleIcon, ClipboardListIcon } from './IconComponents';
import { AppointmentsCard } from './AppointmentsCard';
import { DoctorsConnectedCard } from './DoctorsConnectedCard';
import { HealthAreasCard } from './HealthAreasCard';
import { AddAppointmentModal } from './AddAppointmentModal';
import { AllAppointmentsModal } from './AllAppointmentsModal';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { DentistFinder } from './DentistFinder';
import { FindDentistModal } from './FindDentistModal';
import { fileToDataUrl } from '../utils/imageUtils';
import { ReviewsCard } from './ReviewsCard';
import { ReviewDetailModal } from './ReviewDetailModal';


interface DashboardProps {
    user: User;
    onUpdateUser: (user: User) => void;
    allUsers: User[];
    onUpdateUsers: (users: User[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, allUsers, onUpdateUsers }) => {
    const [photoSent, setPhotoSent] = useState(false);
    const [photoSentMessage, setPhotoSentMessage] = useState('');
    
    // State for modals
    const [isAddAppointmentModalOpen, setAddAppointmentModalOpen] = useState(false);
    const [isAllAppointmentsModalOpen, setAllAppointmentsModalOpen] = useState(false);
    const [isFindDoctorModalOpen, setFindDoctorModalOpen] = useState(false);
    const [isProfileSettingsModalOpen, setProfileSettingsModalOpen] = useState(false);
    const [viewingReview, setViewingReview] = useState<PatientAnalysis | null>(null);
    
    // Health areas start empty and would be populated by a dentist's analysis
    const [healthAreas, setHealthAreas] = useState<HealthArea[]>([]);

    const appointments = user.appointments || [];

    const connectedDentists = allUsers.filter(
        u => u.role === 'dentist' && user.connectedDentistIds?.includes(u.id)
    );
    
    const handleImageUpload = async (file: File) => {
        try {
            const imageDataUrl = await fileToDataUrl(file);
            
            const connectedDentistUsers = allUsers.filter(u => 
                u.role === 'dentist' && user.connectedDentistIds?.includes(u.id)
            );
    
            if (connectedDentistUsers.length === 0) {
                setPhotoSentMessage("You have no connected doctors to send a photo to. Please connect with a doctor first.");
                setPhotoSent(true);
                setTimeout(() => setPhotoSent(false), 5000);
                return;
            }
    
            const newScan: PendingScan = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                imageDataUrl: imageDataUrl,
            };
    
            const usersToUpdate = connectedDentistUsers.map(dentist => {
                const updatedPatients = dentist.patients?.map(p => {
                    if (p.id === user.id) {
                        return {
                            ...p,
                            pendingScans: [...(p.pendingScans || []), newScan]
                        };
                    }
                    return p;
                });
                return { ...dentist, patients: updatedPatients };
            });
    
            onUpdateUsers(usersToUpdate as User[]);
            
            setPhotoSentMessage("Photo sent to your connected doctor(s) for review.");
            setPhotoSent(true);
            setTimeout(() => setPhotoSent(false), 5000);
        } catch (error) {
            console.error("Failed to process image upload:", error);
            setPhotoSentMessage("An error occurred while sending your photo. Please try again.");
            setPhotoSent(true);
            setTimeout(() => setPhotoSent(false), 5000);
        }
    };
    
    const handleAddAppointment = (appointment: Appointment) => {
        // 1. Update the patient's own appointment list
        const updatedPatient: User = {
            ...user,
            appointments: [...(user.appointments || []), appointment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        };
    
        const usersToUpdate = [updatedPatient];
    
        // 2. Find connected dentists and update their patient records
        const connectedDentistIds = user.connectedDentistIds || [];
        const dentistsToUpdate = allUsers.filter(u => u.role === 'dentist' && connectedDentistIds.includes(u.id));
    
        dentistsToUpdate.forEach(dentist => {
            const updatedPatients = dentist.patients?.map(p => {
                if (p.id === user.id) {
                    return {
                        ...p,
                        appointments: [...(p.appointments || []), appointment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    };
                }
                return p;
            });
            usersToUpdate.push({ ...dentist, patients: updatedPatients });
        });
    
        onUpdateUsers(usersToUpdate);
    };

    const receivedReviews = user.reviewsReceived || [];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <ProfileCard user={user} onEditProfile={() => setProfileSettingsModalOpen(true)} />
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Upcoming Appointments" value={appointments.length.toString()} subtitle="View your schedule" icon={<CalendarIcon className="h-6 w-6" />} color="from-blue-500 to-blue-600" />
                <StatCard title="Connected Doctors" value={connectedDentists.length.toString()} subtitle="Ready to assist you" icon={<StethoscopeIcon className="h-6 w-6" />} color="from-teal-500 to-teal-600" />
                 <StatCard title="Received Reviews" value={receivedReviews.length.toString()} subtitle="From your doctors" icon={<ClipboardListIcon className="h-6 w-6" />} color="from-indigo-500 to-indigo-600" />
                <StatCard title="Focus Areas" value={healthAreas.filter(a => a.status === 'Needs Attention').length.toString()} subtitle="Needing attention" icon={<DentalIcon className="h-6 w-6" />} color="from-amber-500 to-amber-600" />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex flex-col justify-center">
                        {photoSent ? (
                            <div className="text-center text-green-600 animate-fade-in">
                                <CheckCircleIcon className="h-16 w-16 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold">Photo Sent!</h3>
                                <p>{photoSentMessage}</p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Have a Concern?</h3>
                                <p className="text-center text-gray-500 mb-4">Upload a photo for your dentist to review. This is not an automated analysis.</p>
                                <ImageUploader onImageUpload={handleImageUpload} />
                            </div>
                        )}
                    </div>
                    <AppointmentsCard appointments={appointments} onAddAppointment={() => setAddAppointmentModalOpen(true)} onViewAll={() => setAllAppointmentsModalOpen(true)} />
                     <ReviewsCard 
                        reviews={receivedReviews} 
                        onSelectReview={setViewingReview} 
                        onScheduleAppointment={() => setAddAppointmentModalOpen(true)}
                    />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <DentistFinder issues={[]} />
                    <DoctorsConnectedCard connectedDentists={connectedDentists} onFindDoctor={() => setFindDoctorModalOpen(true)} />
                    <HealthAreasCard healthAreas={healthAreas} />
                </div>
            </div>

            {/* Modals */}
            {isAddAppointmentModalOpen && <AddAppointmentModal onClose={() => setAddAppointmentModalOpen(false)} onAppointmentAdd={handleAddAppointment} />}
            {isAllAppointmentsModalOpen && <AllAppointmentsModal appointments={appointments} onClose={() => setAllAppointmentsModalOpen(false)} />}
            {isFindDoctorModalOpen && <FindDentistModal currentUser={user} allUsers={allUsers} onClose={() => setFindDoctorModalOpen(false)} onUpdateUsers={onUpdateUsers} />}
            {isProfileSettingsModalOpen && <ProfileSettingsModal user={user} onClose={() => setProfileSettingsModalOpen(false)} onProfileUpdate={onUpdateUser} />}
            {viewingReview && <ReviewDetailModal analysis={viewingReview} onClose={() => setViewingReview(null)} />}
        </div>
    );
};