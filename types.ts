// FIX: Removed circular dependency where the file was importing PatientAnalysis from itself.
export type UserRole = 'patient' | 'dentist';

export interface DetectedIssue {
  name: string;
  description: string;
  confidence: string; // Could be 'High'/'Medium'/'Low' for patient or '0-100' for dentist
  location?: string;
  tip?: string;
}

export interface AnalysisResult {
  summary: string;
  issues: DetectedIssue[];
  disclaimer: string;
}

export interface PendingScan {
    id: string;
    date: string;
    imageDataUrl: string;
}

export interface PatientAnalysis {
    date: string;
    imageDataUrl: string;
    result: AnalysisResult;
    dentistNotes?: string;
    sentToPatient?: boolean; // Flag to track if the review was sent
    fromDoctorName?: string; // Name of the dentist who sent the review
    appointmentRecommended?: boolean; // Flag if doctor recommends a follow-up
}

export interface Patient {
    id: string;
    name: string;
    lastVisit: string;
    analysisHistory: PatientAnalysis[];
    pendingScans?: PendingScan[];
    appointments?: Appointment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileComplete: boolean;
  password?: string;
  // Patient-specific
  dob?: string;
  gender?: string;
  address?: string;
  connectedDentistIds?: string[];
  sentConnectionRequests?: string[];
  reviewsReceived?: PatientAnalysis[]; // To store reviews sent by dentists
  appointments?: Appointment[]; // Add appointments to the main user type
  // Dentist-specific
  specialty?: string;
  patients?: Patient[];
  // FIX: Changed pendingConnections to be an array of objects to match its usage.
  pendingConnections?: { patientId: string; patientName: string; }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string; // Kept optional as it's not in the add form
}

export interface HealthArea {
  name: string;
  status: 'Good' | 'Needs Attention';
}