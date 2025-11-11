import React, { useState, useEffect } from 'react';
import type { Patient, AnalysisResult, User, PendingScan, PatientAnalysis, Appointment } from '../types';
import { UserCircleIcon, MagicWandIcon, AlertTriangleIcon, ClipboardListIcon, SendIcon, CalendarIcon, CheckCircleIcon } from './IconComponents';
import { ReportDisplay } from './ReportDisplay';
import { AIAssistantTools } from './AIAssistantTools';
import { ImageUploader } from './ImageUploader';
import { Spinner } from './Spinner';
import { analyzeDentalImage, editDentalImage } from '../services/geminiService';
import { dataUrlToBase64, dataUrlToFile, fileToBase64, fileToDataUrl } from '../utils/imageUtils';
import { AppointmentsCard } from './AppointmentsCard';
import { AddAppointmentModal } from './AddAppointmentModal';
import { AllAppointmentsModal } from './AllAppointmentsModal';


interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  dentistUser: User;
  allUsers: User[];
  onUpdateUsers: (users: User[]) => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack, dentistUser, allUsers, onUpdateUsers }) => {
    const [imageForAnalysis, setImageForAnalysis] = useState<File | null>(null);
    const [reviewedScanId, setReviewedScanId] = useState<string | null>(null);
    const [xrayImageUrl, setXrayImageUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [dentistNotes, setDentistNotes] = useState('');
    const [historyNotes, setHistoryNotes] = useState<Record<number, string>>({});
    const [recommendAppointment, setRecommendAppointment] = useState<Record<number, boolean>>({});
    const [isConverting, setIsConverting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [isAddAppointmentModalOpen, setAddAppointmentModalOpen] = useState(false);
    const [isAllAppointmentsModalOpen, setAllAppointmentsModalOpen] = useState(false);
    const [completedScanId, setCompletedScanId] = useState<string | null>(null);

    useEffect(() => {
      const initialNotes: Record<number, string> = {};
      patient.analysisHistory.forEach((analysis, index) => {
          initialNotes[index] = analysis.dentistNotes || '';
      });
      setHistoryNotes(initialNotes);
    }, [patient.analysisHistory]);

    // When the patient data updates from the parent, clear the temporary completed state.
    useEffect(() => {
        if (completedScanId) {
            const timer = setTimeout(() => setCompletedScanId(null), 1500); // Clears the "Saved!" state
            return () => clearTimeout(timer);
        }
    }, [patient.pendingScans, completedScanId]);
  
    const resetAnalysisState = () => {
      setImageForAnalysis(null);
      setReviewedScanId(null);
      setXrayImageUrl(null);
      setAnalysisResult(null);
      setAnalysisError(null);
      setDentistNotes('');
    };
  
    const handleImageUpload = (file: File) => {
      resetAnalysisState();
      setImageForAnalysis(file);
    };
  
    const handleConvertToXray = async () => {
        if (!imageForAnalysis) return;
        setIsConverting(true);
        setXrayImageUrl(null);
        setAnalysisError(null);
        try {
            const base64String = await fileToBase64(imageForAnalysis);
            const prompt = "Transform this photograph of teeth into a highly detailed and realistic dental radiograph (X-ray). The output should be monochrome, with high contrast to clearly delineate enamel, dentin, and pulp chambers. Emphasize the bone structure supporting the teeth and ensure root apices are visible. The final image should be clean, clear, and optimized for diagnostic AI analysis, highlighting potential areas of concern such as interproximal caries or bone loss.";
            const xrayBase64 = await editDentalImage(base64String, prompt);
            setXrayImageUrl(`data:image/jpeg;base64,${xrayBase64}`);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : 'Failed to convert image.');
        } finally {
            setIsConverting(false);
        }
    };
  
    const handleAnalyze = async (imageSource: File | string) => {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);
  
      try {
          let base64String: string;
          if (typeof imageSource === 'string') {
              base64String = dataUrlToBase64(imageSource);
          } else {
              base64String = await fileToBase64(imageSource);
          }
          const result = await analyzeDentalImage(base64String, 'dentist');
          setAnalysisResult(result);
      } catch (err) {
          setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze image.');
      } finally {
          setIsAnalyzing(false);
      }
    };

    const handleSaveAnalysis = async () => {
        if (!analysisResult || (!imageForAnalysis && !xrayImageUrl)) return;

        const imageToSave = xrayImageUrl 
            ? xrayImageUrl
            : await fileToDataUrl(imageForAnalysis!);

        const newHistoryItem: PatientAnalysis = {
            date: new Date().toISOString().split('T')[0],
            imageDataUrl: imageToSave,
            result: analysisResult,
            dentistNotes: dentistNotes,
            sentToPatient: false, // Not sent by default
        };

        const updatedPatients = dentistUser.patients?.map(p => {
            if (p.id === patient.id) {
                return {
                    ...p,
                    analysisHistory: [...p.analysisHistory, newHistoryItem],
                    pendingScans: reviewedScanId 
                        ? p.pendingScans?.filter(s => s.id !== reviewedScanId)
                        : p.pendingScans,
                };
            }
            return p;
        });

        if (reviewedScanId) {
            setCompletedScanId(reviewedScanId);
        }
        
        const updatedDentist = { ...dentistUser, patients: updatedPatients };
        onUpdateUsers([updatedDentist]);
        resetAnalysisState();
    };

    const handleReviewScan = async (scan: PendingScan) => {
        resetAnalysisState();
        try {
            const file = await dataUrlToFile(scan.imageDataUrl, `scan-${scan.id}.jpg`);
            setImageForAnalysis(file);
            setReviewedScanId(scan.id);
        } catch (error) {
            console.error("Error converting data URL to file:", error);
            setAnalysisError("Could not load the patient's scan for review.");
        }
    };

    const handleMarkAsReviewed = (scanId: string) => {
        const updatedPatients = dentistUser.patients?.map(p => {
            if (p.id === patient.id) {
                return {
                    ...p,
                    pendingScans: p.pendingScans?.filter(s => s.id !== scanId),
                };
            }
            return p;
        });
        const updatedDentist = { ...dentistUser, patients: updatedPatients };
        onUpdateUsers([updatedDentist]);
    };

    const handleUpdateHistoryNote = (index: number) => {
        const noteToSave = historyNotes[index];
        const updatedPatients = dentistUser.patients?.map(p => {
            if (p.id === patient.id) {
                const updatedHistory = [...p.analysisHistory];
                updatedHistory[index] = { ...updatedHistory[index], dentistNotes: noteToSave };
                return { ...p, analysisHistory: updatedHistory };
            }
            return p;
        });
        const updatedDentist = { ...dentistUser, patients: updatedPatients };
        onUpdateUsers([updatedDentist]);
    };

    const handleSendToPatient = (analysis: PatientAnalysis, index: number) => {
        const patientUser = allUsers.find(u => u.id === patient.id);
        if (!patientUser) return;

        // Create the analysis object to be sent
        const analysisToSend: PatientAnalysis = {
            ...analysis,
            fromDoctorName: dentistUser.name,
            appointmentRecommended: recommendAppointment[index] || false
        };

        // 1. Prepare updated patient user object
        const updatedPatientUser: User = {
            ...patientUser,
            reviewsReceived: [...(patientUser.reviewsReceived || []), analysisToSend]
        };
        
        // 2. Prepare updated dentist user object to mark as sent
        const updatedDentist = { ...dentistUser };
        const dentistPatientRecord = updatedDentist.patients?.find(p => p.id === patient.id);
        if (dentistPatientRecord) {
            const newHistory = [...dentistPatientRecord.analysisHistory];
            newHistory[index] = { ...newHistory[index], sentToPatient: true };
            updatedDentist.patients = updatedDentist.patients?.map(p => 
                p.id === patient.id ? { ...p, analysisHistory: newHistory } : p
            );
        }
        
        // 3. Update both users' states
        onUpdateUsers([updatedPatientUser, updatedDentist]);
    };

    const handleAddAppointment = (newAppointment: Appointment) => {
        // 1. Update the dentist's record of the patient's appointments
        const updatedPatientsForDentist = dentistUser.patients?.map(p => {
            if (p.id === patient.id) {
                const updatedAppointments = [...(p.appointments || []), newAppointment]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return { ...p, appointments: updatedAppointments };
            }
            return p;
        });
        const updatedDentist = { ...dentistUser, patients: updatedPatientsForDentist };
    
        // 2. Find the main patient user object and update their personal list
        const patientUser = allUsers.find(u => u.id === patient.id);
        if (!patientUser) {
            onUpdateUsers([updatedDentist]);
            return;
        }
    
        const updatedPatientUser = {
            ...patientUser,
            appointments: [...(patientUser.appointments || []), newAppointment]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        };
    
        // 3. Update both the dentist and the patient user objects
        onUpdateUsers([updatedDentist, updatedPatientUser]);
    };

    const renderPendingScans = () => {
        const sortedScans = [...(patient.pendingScans || [])].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Scans for Review from Patient</h2>
                    <div className="flex items-center justify-end">
                        <label htmlFor="scan-sort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                        <select
                            id="scan-sort"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {sortedScans.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {sortedScans.map(scan => {
                            const isCompleted = scan.id === completedScanId;
                            return (
                                <div key={scan.id} className={`border rounded-lg p-3 space-y-2 bg-slate-50 flex flex-col transition-all duration-500 ${isCompleted ? 'opacity-40 bg-green-50' : 'opacity-100'}`}>
                                    <img src={scan.imageDataUrl} alt={`Scan from ${scan.date}`} className="rounded shadow-sm aspect-square object-cover"/>
                                    <p className="text-sm text-slate-600 flex-grow">Sent on: {scan.date}</p>
                                    {isCompleted ? (
                                        <div className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                                           <CheckCircleIcon className="h-5 w-5" />
                                           Saved!
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleReviewScan(scan)}
                                                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Review & Analyze
                                            </button>
                                             <button
                                                onClick={() => handleMarkAsReviewed(scan.id)}
                                                className="w-full bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 text-sm"
                                            >
                                                Mark as Reviewed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No pending scans from this patient.</p>
                )}
            </div>
        );
    };

    const renderNewAnalysisSection = () => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800">{reviewedScanId ? 'Reviewing Patient Scan' : 'Add New Analysis'}</h2>
                 {(imageForAnalysis && !analysisResult) && (
                    <button onClick={resetAnalysisState} className="text-sm font-semibold text-slate-600 hover:text-slate-800">
                        Cancel
                    </button>
                 )}
            </div>

            {analysisResult ? (
                <div className="space-y-4 animate-fade-in">
                     <ReportDisplay result={analysisResult} role="dentist" />
                     <AIAssistantTools issues={analysisResult.issues} />
                     <div className="mt-4">
                        <label htmlFor="dentist-notes" className="block text-lg font-bold text-gray-800 mb-2">Dentist's Notes</label>
                        <textarea
                            id="dentist-notes"
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                            placeholder="Add your professional observations here..."
                            value={dentistNotes}
                            onChange={(e) => setDentistNotes(e.target.value)}
                        />
                    </div>
                     <button onClick={handleSaveAnalysis} className="font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm">
                        Save Analysis to History
                     </button>
                </div>
            ) : isAnalyzing ? (
                <div className="flex flex-col items-center justify-center p-8">
                    <Spinner />
                    <p className="mt-2 text-blue-600 font-semibold">AI is analyzing, please wait...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {!imageForAnalysis ? (
                        <div>
                             <p className="text-slate-600 mb-4 text-center">Upload a scan from your device to begin a new analysis.</p>
                             <ImageUploader onImageUpload={handleImageUpload} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {analysisError && (
                                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-sm flex items-start">
                                    <AlertTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <p className="font-bold text-sm">{analysisError}</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                {/* Original Image */}
                                <div className="text-center space-y-3 p-4 border rounded-lg bg-slate-50">
                                     <h4 className="font-semibold text-slate-700">Original Image</h4>
                                     <img src={URL.createObjectURL(imageForAnalysis)} alt="Uploaded scan" className="rounded-lg shadow-md border mx-auto"/>
                                     <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                         <button onClick={handleConvertToXray} disabled={isConverting || isAnalyzing} className="flex-1 justify-center items-center gap-2 inline-flex bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition-colors">
                                            <MagicWandIcon className="w-5 h-5" />
                                            {isConverting ? 'Converting...' : 'To X-Ray'}
                                         </button>
                                         <button onClick={() => handleAnalyze(imageForAnalysis!)} disabled={isAnalyzing || isConverting} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors">
                                            Analyze Original
                                         </button>
                                     </div>
                                </div>

                                {/* X-ray Image */}
                                <div className="text-center space-y-3 p-4 border rounded-lg bg-slate-50 min-h-[200px] flex flex-col justify-center">
                                    <h4 className="font-semibold text-slate-700">Generated X-ray Style Image</h4>
                                    {isConverting ? (
                                        <div className="py-8"><Spinner /></div>
                                    ) : (
                                        xrayImageUrl ? (
                                            <div className="space-y-3 animate-fade-in">
                                                <img src={xrayImageUrl} alt="X-ray style" className="rounded-lg shadow-md border mx-auto"/>
                                                <button onClick={() => handleAnalyze(xrayImageUrl)} disabled={isAnalyzing || isConverting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors">
                                                    Analyze X-ray
                                                </button>
                                            </div>
                                        ) : <p className="text-slate-500 py-8">Convert the original image to see an X-ray style version here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      );

    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={onBack} className="font-semibold text-blue-600 hover:text-blue-700">
                &larr; Back to Patient List
            </button>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 p-4 rounded-full">
                        <UserCircleIcon className="h-12 w-12 text-slate-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
                        <p className="text-gray-500">Last Visit: {patient.lastVisit}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <AppointmentsCard 
                    appointments={patient.appointments || []} 
                    onAddAppointment={() => setAddAppointmentModalOpen(true)}
                    onViewAll={() => setAllAppointmentsModalOpen(true)}
                />
            </div>

            {renderPendingScans()}
            {renderNewAnalysisSection()}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis History</h2>
                {patient.analysisHistory.length > 0 ? (
                    <div className="space-y-8">
                        {patient.analysisHistory.map((analysis, index) => (
                           <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Analysis from {analysis.date}</h3>
                               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                    <div>
                                        <img 
                                            src={analysis.imageDataUrl} 
                                            alt={`Scan from ${analysis.date}`}
                                            className="rounded-lg shadow-md border w-full"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <ReportDisplay result={analysis.result} role="dentist" />
                                        <AIAssistantTools issues={analysis.result.issues} />
                                    </div>
                               </div>
                               <div className="mt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                        <div className="flex-grow">
                                            <label htmlFor={`history-notes-${index}`} className="block text-base font-semibold text-gray-700 mb-1 flex items-center">
                                                <ClipboardListIcon className="h-5 w-5 mr-2" />
                                                Dentist's Notes
                                            </label>
                                            <textarea
                                                id={`history-notes-${index}`}
                                                rows={3}
                                                className="w-full p-2 border border-gray-300 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition text-slate-900"
                                                placeholder="Add or edit notes..."
                                                value={historyNotes[index] || ''}
                                                onChange={(e) => setHistoryNotes(prev => ({...prev, [index]: e.target.value}))}
                                            />
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleUpdateHistoryNote(index)}
                                                disabled={historyNotes[index] === (analysis.dentistNotes || '')}
                                                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Save Notes
                                            </button>

                                            <div className="relative p-2 border rounded-md bg-slate-50">
                                                <div className="flex items-center">
                                                    <input
                                                        id={`recommend-appt-${index}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={recommendAppointment[index] || false}
                                                        onChange={(e) => setRecommendAppointment(prev => ({...prev, [index]: e.target.checked}))}
                                                        disabled={analysis.sentToPatient}
                                                    />
                                                    <label htmlFor={`recommend-appt-${index}`} className="ml-2 block text-sm text-gray-900">
                                                        Recommend Follow-up
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleSendToPatient(analysis, index)}
                                                disabled={analysis.sentToPatient}
                                                className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md disabled:bg-green-600 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <SendIcon className="h-4 w-4" />
                                                {analysis.sentToPatient ? 'Sent' : 'Send to Patient'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No analysis history available for this patient.</p>
                )}
            </div>

            {isAddAppointmentModalOpen && <AddAppointmentModal onClose={() => setAddAppointmentModalOpen(false)} onAppointmentAdd={handleAddAppointment} />}
            {isAllAppointmentsModalOpen && <AllAppointmentsModal appointments={patient.appointments || []} onClose={() => setAllAppointmentsModalOpen(false)} />}
        </div>
    );
};