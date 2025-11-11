import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnalysisResult, DetectedIssue, Appointment, WebSource } from '../types';

if (!process.env.API_KEY) {
    // In a real app, this would be handled more gracefully.
    // For this project, we'll alert and throw to avoid silent failures.
    alert("API_KEY environment variable not set. Please provide it in a .env file.");
    throw new Error("API_KEY not configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a dental scan image.
 */
export const analyzeDentalImage = async (base64Image: string, role: 'patient' | 'dentist'): Promise<AnalysisResult> => {
    const model = 'gemini-2.5-flash';
    
    const patientPrompt = "You are an AI dental assistant. Analyze this dental scan from a patient's perspective. Provide a simple, easy-to-understand summary. Identify potential issues like cavities, plaque, or gum inflammation using simple terms. For each issue, give a confidence level (High, Medium, Low) and a helpful care tip. Do not provide a medical diagnosis. Include a clear disclaimer that this is not a substitute for professional dental advice.";
    const dentistPrompt = "You are an expert AI radiology assistant for dentists. Analyze this dental scan. Provide a concise professional summary. Identify potential anomalies (e.g., caries, periodontal issues, abscesses) and specify their likely location (e.g., tooth number). For each finding, provide a numerical confidence score from 0 to 100. Include a disclaimer that this is an AI-assisted analysis and requires professional validation.";

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: role === 'patient' ? patientPrompt : dentistPrompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    issues: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                confidence: { type: Type.STRING },
                                location: { type: Type.STRING },
                                tip: { type: Type.STRING }
                            },
                            required: ["name", "description", "confidence"]
                        }
                    },
                    disclaimer: { type: Type.STRING }
                },
                required: ["summary", "issues", "disclaimer"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

/**
 * Generates speech from text.
 */
export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly and calmly: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Failed to generate audio.");
    }
    return base64Audio;
};

/**
 * Edits a dental image based on a text prompt.
 */
export const editDentalImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType: 'image/jpeg' } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No edited image was generated.");
};

/**
 * Finds local dentists using Google Maps grounding.
 */
export const findDentists = async (issues: string[], location: { latitude: number, longitude: number }): Promise<{ response: string; places: WebSource[] }> => {
    const issuesQueryPart = issues.length > 0 ? ` that can help with ${issues.join(', ')}` : '';
    const query = `Find reputable dentists, dental clinics, or oral surgeons near me${issuesQueryPart}. Provide a brief summary of the types of professionals found.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude
                    }
                }
            }
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places: WebSource[] = groundingChunks
        .filter(chunk => chunk.maps)
        .map(chunk => ({
            uri: chunk.maps.uri,
            title: chunk.maps.title
        }));

    return { response: response.text, places };
};

/**
 * Gets information about a dental issue using Google Search grounding.
 */
export const getDentalIssueInfo = async (issueName: string): Promise<{ explanation: string, sources: WebSource[] }> => {
    const query = `Explain the dental issue "${issueName}" in simple terms. What are common causes and treatments?`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: WebSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title
        }));

    return { explanation: response.text, sources };
};

/**
 * Generates a patient-friendly summary of detected issues.
 */
export const generatePatientSummary = async (issues: DetectedIssue[]): Promise<string> => {
    // Handle the case where there are no issues.
    if (issues.length === 0) {
        return "Based on the AI analysis, no significant potential issues were detected. It's always best to maintain good oral hygiene and continue with regular dental check-ups.";
    }
    const issueText = issues.map(i => `- ${i.name} (Confidence: ${i.confidence}): ${i.description}`).join('\n');
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following AI analysis, write a brief, empathetic, and easy-to-understand summary for a patient. Avoid technical jargon. Encourage them to discuss these points with their dentist.\n\nAnalysis:\n${issueText}`,
    });
    return response.text;
};

/**
 * Performs a general search with Google Search grounding.
 */
export const generalSearch = async (query: string): Promise<{ response: string, sources: WebSource[] }> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: WebSource[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title
        }));
    
    return { response: response.text, sources };
};

/**
 * Parses natural language text to create an appointment.
 */
export const parseAppointment = async (text: string): Promise<Appointment> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Parse the following text and extract the appointment details. The current year is ${new Date().getFullYear()}. Return the date in YYYY-MM-DD format. \n\nText: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    doctor: { type: Type.STRING },
                    date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                    time: { type: Type.STRING, description: "Time, e.g., 2:00 PM" }
                },
                required: ["title", "doctor", "date", "time"]
            }
        }
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    return { ...parsedData, id: Date.now().toString() };
};