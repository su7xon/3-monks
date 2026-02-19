
import React, { useState, useRef, useEffect } from 'react';
import { getStylistAdvice } from '../services/groqService';
import { useShop } from '../store';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIStylist: React.FC = () => {
    const { products } = useShop();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userQuery = query.trim();
        if (!userQuery) return;

        const newMessages = [...messages, { role: 'user', content: userQuery } as Message];
        setMessages(newMessages);
        setQuery('');
        setIsLoading(true);

        try {

            const response = await getStylistAdvice(newMessages, products);
            setMessages([...newMessages, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error getting advice:', error);
            setMessages([...newMessages, { role: 'assistant', content: "Sorry, I couldn't get fashion advice right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const lastAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant');

    return (
        <div className="w-full max-w-md mx-auto px-4 animate-fade-in">
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-xl">✨</span>
                </div>
                <form onSubmit={handleSubmit} className="w-full">
                    <input
                        type="text"
                        className="block w-full p-3 pl-10 pr-20 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-black focus:border-black placeholder:text-gray-400 font-medium tracking-wide shadow-sm"
                        placeholder="Ask AI Stylist..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-md text-[10px] px-3 py-1.5 uppercase tracking-wider disabled:opacity-50 transition-all"
                    >
                        {isLoading ? '...' : 'Ask'}
                    </button>
                </form>
            </div>

            { }
            {lastAssistantMessage && (
                <div className="mt-3 p-3 bg-gray-100 border-l-4 border-black rounded-r-md text-xs text-gray-700 leading-relaxed relative animate-fade-in">
                    <button
                        onClick={() => setMessages([])}
                        className="absolute top-1 right-1 text-gray-400 hover:text-black transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <p className="pr-4"><span className="font-bold uppercase tracking-wide mr-1 text-[10px] text-black">Stylist Says:</span> {lastAssistantMessage.content}</p>
                </div>
            )}
        </div>
    );
};

export default AIStylist;
