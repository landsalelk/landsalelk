'use client';

import { useState, useEffect, useRef } from 'react';
import { account } from '@/lib/appwrite';
import { sendMessage, subscribeToMessages, getConversation } from '@/lib/chat';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWidget({ agentId, agentName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    // Load User & History
    useEffect(() => {
        async function init() {
            try {
                const user = await account.get();
                setCurrentUser(user);
                if (agentId) {
                    const history = await getConversation(agentId);
                    setMessages(history);
                }
            } catch (e) {
                // Not logged in
            }
        }
        if (isOpen) init();
    }, [isOpen, agentId]);

    // Realtime Subscription
    useEffect(() => {
        if (!currentUser || !agentId) return;

        const unsubscribe = subscribeToMessages(currentUser.$id, (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => unsubscribe();
    }, [currentUser, agentId]);

    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            await sendMessage(agentId, newMessage);
            setNewMessage('');
        } catch (e) {
            console.error("Send failed", e);
        }
    };

    if (!agentId) return null; // Don't show if no target

    return (
        <div className="fixed bottom-6 right-6 z-50">

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-emerald-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{agentName || 'Agent'}</h3>
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4" ref={scrollRef}>
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser?.$id;
                            return (
                                <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] p-3 rounded-2xl text-sm",
                                        isMe
                                            ? "bg-emerald-600 text-white rounded-tr-none"
                                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 text-xs mt-10">
                                Start a conversation with {agentName}...
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>

                </div>
            )}

        </div>
    );
}
