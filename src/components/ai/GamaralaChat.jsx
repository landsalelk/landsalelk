'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const KNOWLEDGE_BASE = {
    'hello': "Ayubowan! I am Gamarala, your AI real estate assistant. How can I help you today? You can ask me about stamp duty, NBRO, or finding lands.",
    'hi': "Hello! I am Gamarala. How can I assist you with your property search?",
    'stamp duty': "For property transfers, Stamp Duty is typically 4% of the property value. It's usually paid by the buyer.",
    'legal': "We recommend checking the Title Deed (30-year history), Survey Plan, and Non-Vesting Certificate. Our Legal Vault can help you verify these.",
    'nbro': "NBRO (National Building Research Organisation) certification is mandatory for lands in landslide-prone areas. It classifies risk as Low, Medium, or High.",
    'fees': "LandSale.lk is free for buyers! Sellers pay a small listing fee for premium features.",
    'agent': "You can find verified agents in our 'Agents' section. Look for the 'Verified' badge for extra trust.",
    'loan': "Most banks in Sri Lanka offer housing loans up to 70% of the property value. Interest rates currently range from 12-15% (variable).",
    'default': "I'm not sure about that specific detail yet, but I can connect you with a human agent. Try asking about 'stamp duty', 'loans', or 'NBRO'."
};

export function GamaralaChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Ayubowan! I'm Gamarala. Ask me anything about Sri Lankan real estate!" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const lowerInput = userMsg.toLowerCase();
            let botResponse = KNOWLEDGE_BASE['default'];

            // Simple keyword matching
            for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
                if (lowerInput.includes(key)) {
                    botResponse = value;
                    break;
                }
            }

            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 lg:bottom-6 ${isOpen ? 'scale-0 opacity-0' : 'bg-[#10b981] text-white scale-100 opacity-100'}`}
            >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                <Bot className="w-8 h-8" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 left-4 z-40 lg:bottom-6 lg:right-6 lg:left-auto lg:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 transition-all duration-300 transform origin-bottom-right flex flex-col overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}`} style={{ maxHeight: '70vh' }}>

                {/* Header */}
                <div className="bg-[#10b981] p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Gamarala AI</h3>
                            <p className="text-xs text-emerald-100 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-[#10b981] text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about lands, loans..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 p-2 bg-[#10b981] text-white rounded-full hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" /> Powered by LandSale Intelligence
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}
