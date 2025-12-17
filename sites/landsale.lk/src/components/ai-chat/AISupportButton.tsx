"use client";

import React, { useState } from 'react';
import { AIChatWidget } from './AIChatWidget';
import { MessageCircle, X } from 'lucide-react';

const AGENT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop";

export const AISupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">

        {/* Tooltip / Call to action */}
        {!isOpen && (
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-2xl rounded-br-none shadow-xl border border-gray-100 dark:border-gray-700 mb-2 animate-bounce mr-2 pointer-events-auto origin-bottom-right">
            <p className="text-sm font-medium whitespace-nowrap">👋 Hi! Chat with Priya</p>
          </div>
        )}

        {/* Chat Head Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group pointer-events-auto transition-transform active:scale-95"
          aria-label="Toggle AI Chat"
        >
          {/* Main Avatar Circle */}
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-2xl border-2 transition-all duration-300 ${isOpen ? 'border-gray-500 ring-4 ring-gray-200 dark:ring-gray-700' : 'border-white ring-4 ring-emerald-500/30 hover:ring-emerald-500/50'}`}>
            <img
              src={AGENT_PROFILE_IMAGE}
              alt="Priya"
              className="w-full h-full object-cover"
            />

            {/* Overlay when open */}
            {isOpen && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                <X className="text-white drop-shadow-md" size={24} />
              </div>
            )}
          </div>

          {/* Online Indicator Badge */}
          {!isOpen && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm">
              <span className="absolute inset-0 w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75"></span>
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[calc(100vh-140px)] sm:h-[600px] max-h-[800px] bg-[#efeae2] dark:bg-[#0b141a] rounded-[2rem] shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          <AIChatWidget />
        </div>
      )}
    </div>
  );
};
