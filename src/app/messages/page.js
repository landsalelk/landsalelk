'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { account } from '@/lib/appwrite';
import { sendMessage, getConversation, subscribeToMessages } from '@/lib/chat';
import { getAgents } from '@/lib/agents';
import {
    MessageCircle, Send, Search, User, Clock, Check, CheckCheck,
    Phone, Video, MoreVertical, Smile, Paperclip, ArrowLeft, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MessagesPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef(null);

    const updateConversationPreview = useCallback((msg) => {
        setConversations(prev => prev.map(conv => {
            if (conv.userId === msg.sender_id || conv.userId === msg.receiver_id) {
                return {
                    ...conv,
                    lastMessage: msg.content,
                    lastMessageTime: msg.timestamp,
                    unread: (msg.is_read === false) ? (conv.unread + 1) : conv.unread
                };
            }
            return conv;
        }));
    }, []);

    const loadUserAndConversations = useCallback(async () => {
        try {
            const userData = await account.get();
            setUser(userData);

            // Load real conversations from messages collection
            // For now, show agents as potential contacts (real conversations will be loaded when selected)
            const agents = await getAgents(10);
            const agentContacts = agents.map(agent => ({
                id: agent.$id,
                userId: agent.$id,
                name: agent.name || 'Agent',
                avatar: agent.avatar,
                lastMessage: 'Start a conversation...',
                lastMessageTime: null,
                unread: 0,
                online: false // Actual online status requires presence tracking
            }));
            setConversations(agentContacts);
        } catch (error) {
            console.error(error);
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        setMounted(true);
        loadUserAndConversations();
    }, [loadUserAndConversations, setMounted]); // Added missing dependency

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!user) return;

        // Subscribe to real-time messages
        const unsubscribe = subscribeToMessages(user.$id, (newMsg) => {
            if (activeConversation &&
                (newMsg.sender_id === activeConversation.userId ||
                    newMsg.receiver_id === activeConversation.userId)) {
                setMessages(prev => [...prev, newMsg]);
            }
            // Update conversation preview
            updateConversationPreview(newMsg);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, activeConversation, updateConversationPreview]);

    const openConversation = async (conv) => {
        setActiveConversation(conv);
        try {
            const history = await getConversation(conv.userId);
            setMessages(history);
            // Mark as read
            setConversations(prev => prev.map(c =>
                c.id === conv.id ? { ...c, unread: 0 } : c
            ));
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        setSending(true);
        try {
            const msg = await sendMessage(activeConversation.userId, newMessage.trim());
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
            // Update preview
            setConversations(prev => prev.map(c =>
                c.id === activeConversation.id
                    ? { ...c, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString() }
                    : c
            ));
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
            <div className="max-w-6xl mx-auto px-4">
                <div className="glass-card rounded-3xl overflow-hidden h-[calc(100vh-120px)] flex">

                    {/* Conversations List */}
                    <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100">
                            <h1 className="text-xl font-bold text-slate-800 mb-4">Messages</h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#10b981] text-sm"
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length > 0 ? (
                                conversations.map(conv => (
                                    <button
                                        key={conv.id}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${activeConversation?.id === conv.id ? 'bg-slate-50' : ''
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#d1fae5] to-[#cffafe] rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-[#10b981]" />
                                            </div>
                                            {conv.online && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-slate-800 truncate">{conv.name}</span>
                                                <span className="text-xs text-slate-400">{formatDate(conv.lastMessageTime)}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                                        </div>
                                        {conv.unread > 0 && (
                                            <div className="w-5 h-5 bg-[#10b981] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {conv.unread}
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No conversations yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setActiveConversation(null)}
                                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#d1fae5] to-[#cffafe] rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-[#10b981]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{activeConversation.name}</h3>
                                            <p className="text-xs text-green-500">
                                                {activeConversation.online ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                            <Video className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === user.$id;
                                        return (
                                            <div
                                                key={msg.$id || idx}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                                                    <div className={`px-4 py-2 rounded-2xl ${isMe
                                                        ? 'bg-[#10b981] text-white rounded-br-md'
                                                        : 'bg-white text-slate-800 rounded-bl-md shadow-sm'
                                                        }`}>
                                                        <p>{msg.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span>{formatTime(msg.timestamp || msg.$createdAt)}</span>
                                                        {isMe && (
                                                            msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                                    <button type="button" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#10b981]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="p-3 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Your Messages</h3>
                                <p className="text-slate-500 max-w-sm">
                                    Select a conversation to start chatting with agents about properties
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}