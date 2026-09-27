'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Languages, Loader2, ArrowUpRight } from 'lucide-react';
import { sendCropSathiMessage, CropSathiChatMessage } from '@/lib/api/ai';
import { useAuth } from '@/hooks/useAuth';

export function CropSathiFloating() {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CropSathiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content:
        'Namaste! I am CropSathi, your Digital Farming Assistant. Ask me about crop demand forecasts, mandi prices, agronomy tips, or buyer connections.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChips = [
    { label: '🌾 Wheat Demand', text: 'Which crop demand will be high in the next 7 days?' },
    { label: '🍅 Tomato Soil', text: 'What is the best soil and watering schedule for tomatoes?' },
    { label: '💰 Mandi Rates', text: 'What are the current price trends for Sharbati wheat?' },
    { label: '🌱 Pest Control', text: 'How can I prevent pest damage organically?' },
  ];

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: CropSathiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendCropSathiMessage(text.trim(), language, role || 'farmer');
      const aiMsg: CropSathiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: CropSathiChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'I could not connect to the advisory service right now. Please verify backend connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-gradient-to-r from-emerald-800 to-emerald-600 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30"
          id="cropsathi-floating-btn"
          aria-label="Open CropSathi AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-black tracking-tight leading-none">
              CropSathi AI
            </span>
            <span className="block text-[10px] text-emerald-100 font-medium">
              Farming Assistant
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200"
          role="dialog"
          aria-label="CropSathi AI Chat Window"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-white ring-2 ring-emerald-400/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight">CropSathi</h3>
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  Your Digital Farming Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Selector */}
              <div className="flex items-center bg-emerald-950/60 rounded-xl p-0.5 border border-emerald-700/50">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                    language === 'en' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="English"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                    language === 'hi' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="हिंदी"
                >
                  हिं
                </button>
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                    language === 'mr' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'
                  }`}
                  title="मराठी"
                >
                  मरा
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-full transition-colors ml-1"
                aria-label="Close CropSathi chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 px-1 mt-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 p-3 rounded-2xl w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>CropSathi is analyzing agricultural data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                className="flex items-center gap-1 whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200/60 transition-colors"
              >
                <span>{chip.label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'अपनी फसल या भाव के बारे में पूछें...'
                    : language === 'mr'
                    ? 'पिके किंवा बाजारभावाविषयी विचारा...'
                    : 'Ask about crop demand, prices, or advice...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
