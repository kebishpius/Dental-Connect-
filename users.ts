import type { User, Patient, AnalysisResult } from './types';

// Mock analysis result for patient history
const mockAnalysis: AnalysisResult = {
    summary: "The scan shows evidence of mild plaque buildup on the molars and slight gum inflammation around the lower incisors. Overall dental health appears fair, but proactive hygiene is recommended.",
    issues: [
        { name: "Plaque Buildup", description: "Visible plaque on the surface of posterior teeth.", confidence: "Medium", location: "Teeth 14, 15, 30", tip: "Ensure thorough brushing and flossing, especially in hard-to-reach areas." },
        { name: "Gingivitis", description: "Minor inflammation of the gums, indicated by redness.", confidence: "Low", location: "Lower anterior region", tip: "Gentle but consistent flossing can help reduce gum inflammation." }
    ],
    disclaimer: "This is an AI-assisted analysis and not a substitute for a professional diagnosis. Consult with your dentist for a comprehensive evaluation."
};

// A base64 encoded 1x1 transparent gif
const placeholderImageDataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';


const johnDoePatients: Patient[] = [
    {
        // FIX: Added Jane Doe to the dentist's patient list to ensure two-way connection.
        id: '1',
        name: 'Jane Doe',
        lastVisit: '2024-03-12',
        analysisHistory: [],
        pendingScans: [],
        appointments: [],
    },
    {
        id: 'p1',
        name: 'Alice Williams',
        lastVisit: '2023-11-15',
        analysisHistory: [
            { date: '2023-11-15', imageDataUrl: placeholderImageDataUrl, result: mockAnalysis, sentToPatient: false }
        ],
        pendingScans: [
            { id: 'scan1', date: '2024-05-20', imageDataUrl: placeholderImageDataUrl }
        ],
        appointments: [],
    },
    {
        id: 'p2',
        name: 'Bob Johnson',
        lastVisit: '2023-10-02',
        analysisHistory: [],
        appointments: [],
    }
];

export const users: User[] = [
    {
        id: '1',
        name: 'Jane Doe',
        email: 'patient@example.com',
        password: 'password',
        role: 'patient',
        profileComplete: true,
        dob: '1990-05-15',
        gender: 'Female',
        address: '123 Health St, Wellness City',
        connectedDentistIds: ['2'], // Connected to Dr. John Smith
        sentConnectionRequests: [],
        reviewsReceived: [],
        appointments: [],
    },
    {
        id: '2',
        name: 'Dr. John Smith',
        email: 'dentist@example.com',
        password: 'password',
        role: 'dentist',
        profileComplete: true,
        patients: johnDoePatients,
        specialty: 'General & Cosmetic Dentistry',
        pendingConnections: [],
    },
    {
        id: '3',
        name: 'New User',
        email: 'new@example.com',
        password: 'password',
        role: 'patient',
        profileComplete: false, // This user needs to complete their profile
    }
];