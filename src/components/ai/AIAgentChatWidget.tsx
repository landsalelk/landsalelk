"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

// A simple spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-2">
    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const INITIAL_AI_MESSAGE = {
  sender: 'ai' as const,
  text: "Hello! I'm your LandSale Assistant. How can I help you find a property today?"
};

/**
 * AIAgentChatWidget
 *
 * Floating action button and chat interface for the LandSale AI Agent.
 * Positioned bottom-right, responsive, and branded with full state management.
 * This component handles its own state for visibility, messages, loading, and errors.
 */
export default function AIAgentChatWidget() {
  // State to manage if the chat window is open or closed.
  const [isOpen, setIsOpen] = useState(false);
  // State to hold the history of chat messages, now with an optional error flag.
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string; isError?: boolean }[]>([INITIAL_AI_MESSAGE]);
  // State for the user's current input in the text field.
  const [inputValue, setInputValue] = useState('');
  // State to indicate when the AI is "typing" or processing a message.
  const [isLoading, setIsLoading] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Effect to automatically scroll to the latest message.
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to handle closing the chat window with the "Escape" key for accessibility.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  /**
   * Toggles the visibility of the chat window.
   */
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Handles the logic for sending a user's message.
   * Includes input validation, state updates, and a real API call with error handling.
   */
  const handleSendMessage = async () => {
    // Basic input validation: prevent sending empty or while loading.
    if (inputValue.trim() === '' || isLoading) return;

    const newMessage = { sender: 'user' as const, text: inputValue };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Real API call to the AI backend.
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'The AI agent is currently unavailable.');
      }

      const data = await response.json();
      const aiResponse = { sender: 'ai' as const, text: data.response };

      setMessages((prev) => [...prev, aiResponse]);

    } catch (e: unknown) {
      let errorMessageText: string;
      if (e instanceof Error) {
        errorMessageText = e.message;
      } else {
        errorMessageText = "An unknown error occurred. Please try again.";
      }
      // Add the error as a message from the AI for a better user experience.
      const errorResponse = { sender: 'ai' as const, text: errorMessageText, isError: true };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Triggers message sending when the user presses "Enter".
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // LandSale Brand Colors from globals.css
  const brandPrimary = "bg-[var(--ls-primary)]";
  const brandAccent = "bg-[var(--ls-accent)]";

  return (
    <div className="fixed bottom-6 right-6 z-stack-max font-sans">
      {/* Chat Window (Expanded State) */}
      {isOpen && (
        <div
          className={`
            mb-4 w-[350px] sm:w-[400px] h-[500px]
            bg-white rounded-xl shadow-2xl
            border border-slate-200 flex flex-col overflow-hidden
            animate-in fade-in slide-in-from-bottom-5 duration-200
          `}
          role="dialog" // Accessibility: Informs screen readers this is a dialog window.
          aria-modal="true" // Accessibility: Informs screen readers that content outside this dialog is inert.
        >
          {/* Header */}
          <div className={`${brandPrimary} text-white p-4 flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-bold">AI Agent</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div ref={chatBodyRef} className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-orange-500 text-white'
                    : msg.isError
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <LoadingSpinner />}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--ls-accent)] text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleChat}
        className={`
          ${isOpen ? brandPrimary : brandAccent}
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center text-white text-2xl
          hover:opacity-90 transition-all hover:scale-105
          focus:outline-none focus:ring-4 focus:ring-orange-300
        `}
        aria-label={isOpen ? "Close AI Agent" : "Open AI Agent"}
      >
        {isOpen ? <X size={24} /> : "💬"}
      </button>
    </div>
  );
}
