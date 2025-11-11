import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';
import { ChatBubbleIcon, CloseIcon, SendIcon, StethoscopeIcon } from './IconComponents';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { role: 'model', text: 'Hello! I am your AI dental assistant. How can I help you today? You can ask me about oral hygiene, common dental issues, or how to use this app.' }
            ]);
        } else {
            // Reset state when closing
            setMessages([]);
            setInput('');
            setIsLoading(false);
            setError(null);
            chatSessionRef.current = null;
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            if (!chatSessionRef.current) {
                const apiKey = process.env.API_KEY;
                if (!apiKey) {
                    throw new Error("API key not configured.");
                }
                const ai = new GoogleGenAI({ apiKey });
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                      systemInstruction: 'You are a friendly and helpful AI dental assistant for the DentalConnect app. Your goal is to provide general, informative, and safe advice about dental health and hygiene. You are not a doctor and must not provide diagnosis or medical advice. Always encourage users to consult a professional dentist for any health concerns.',
                    },
                });
            }

            const stream = await chatSessionRef.current.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get response: ${errorMessage}`);
            setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-110 animate-pulse-slow"
                aria-label="Open chat assistant"
            >
                <ChatBubbleIcon className="h-8 w-8" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-md h-full max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col border border-slate-200 animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
                        <div className="flex items-center space-x-2">
                           <StethoscopeIcon className="h-6 w-6 text-blue-600" />
                           <h3 className="text-lg font-bold text-slate-800">AI Dental Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
                           <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-200 text-slate-800 rounded-2xl px-4 py-3 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </div>
                         {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
                    </form>
                </div>
            )}
        </>
    );
};