"use client";

import React, { useState } from "react";

/**
 * AIAgentChatWidget
 *
 * Floating action button and chat interface for the LandSale AI Agent.
 * Positioned bottom-right, responsive, and branded.
 */
export default function AIAgentChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  // LandSale Brand Colors (matching globals.css)
  const brandPrimary = "bg-[var(--ls-primary)]"; // Deep Blue
  const brandAccent = "bg-[var(--ls-accent)]";   // Orange

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
        >
          {/* Header */}
          <div className={`${brandPrimary} text-white p-4 flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              {/* Bot Icon */}
              <span className="text-xl">🤖</span>
              <span className="font-bold">AI Agent</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
            <div className="text-sm text-slate-600">
              <p>Hello! I'm your LandSale Assistant. How can I help you find a property today?</p>
            </div>
            {/* Placeholder for messages */}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[var(--ls-accent)] text-sm"
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
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}
