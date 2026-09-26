import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ArrowRight, CornerDownLeft, Volume2, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';

const QUICK_CHIPS = [
  { label: 'Aaj ka bhav?', query: 'Aaj ka mandi bhav kya chal raha hai gehu aur tamatar ka?' },
  { label: 'Demand forecast', query: 'Which crops will have highest demand in next 30 days?' },
  { label: 'Best route', query: 'Calculate optimal logistics route from Nashik to Mumbai APMC' },
  { label: 'Farming tip', query: 'How to improve wheat grade to A+ for maximum market price?' },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    text: 'Namaste! Main hoon CropSathi, aapka AI Agri Advisor. Main mandi rates, buyer demands, aur fastest logistics routes batane mein madad karta hoon. Aaj main aapki kya madad karoon?',
    time: 'Just now',
  },
];

export default function CropSathiAssistant({ isOpen, onClose, currentRole = 'farmer' }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' | 'हिं' | 'मर'
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Intelligence
    setTimeout(() => {
      let replyText = "";
      const q = query.toLowerCase();

      if (q.includes('bhav') || q.includes('rate') || q.includes('price')) {
        replyText = language === 'हिं'
          ? "📊 **आज का मंडी भाव (APMC Update):**\n• गेहूं (Sharbati): ₹2,850/क्विंटल (📈 +₹70 तेज)\n• टमाटर (Grade A): ₹2,200/क्विंटल (📈 +₹120 तेज)\n• सोयाबीन: ₹4,920/क्विंटल\n\n💡 *CropSathi Tip: अगले 10 दिनों में मुंबई APMC में गेहूं की आवक कम रहने से कीमतें और ₹80-₹120 बढ़ सकती हैं।* "
          : "📊 **Today's APMC Mandi Rates:**\n• Sharbati Wheat (Grade A): ₹2,850/qtl (📈 +₹70)\n• Hybrid Tomatoes: ₹2,200/qtl (📈 +₹120)\n• Soybeans: ₹4,920/qtl\n\n💡 *CropSathi Tip: Supply is tightening in Vashi APMC. We recommend listing with Grade A certification to earn a 5-8% premium over local MSP.*";
      } else if (q.includes('demand') || q.includes('forecast')) {
        replyText = "🌾 **Crop Demand Forecast (Next 30 Days):**\n1. **Organic Tomatoes:** High demand from tier-1 retail chains (+18% YoY)\n2. **Basmati Rice Pusa 1121:** Export buyer activity up 24%\n3. **Red Onions (Nashik):** High institutional buyer buying pressure.\n\nEstimated price stability: High. Farmers holding stock have strong bargaining power.";
      } else if (q.includes('route') || q.includes('logistics') || q.includes('transporter')) {
        replyText = "🚛 **AI Route & Fleet Optimization:**\n• **Selected Route:** Nashik → Samruddhi Mahamarg Corridor → Vashi APMC Terminal\n• **Distance:** 168 km (saves 28 km over old highway)\n• **Estimated Time:** 3 hours 40 mins\n• **Toll & Fuel Savings:** ~₹1,450 per 10-tonne truck\n• **Active Transporters Available:** 6 verified refrigerated trucks ready for dispatch.";
      } else if (q.includes('tip') || q.includes('grade') || q.includes('quality')) {
        replyText = "🌱 **Quality Enhancement for Grade A+:**\n1. Maintain moisture level below 12% during post-harvest drying.\n2. Use hermetic sealed bags for transit to prevent pest intrusion.\n3. Upload photo verification in CropKart to get the golden 'Verified Quality' badge, which attracts 40% faster buyer offers.";
      } else {
        replyText = `Understood! Regarding "${query}", CropKart's AI models show active liquidity in your district. Connecting you with verified counterparties and optimal logistics. Would you like to check current buyer bids or book a transporter?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 750);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface-0 shadow-ambient-xl border-l border-line-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="px-5 py-4 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-400 text-forest-900 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-forest-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">CropSathi AI</h3>
              <span className="bg-lime-400/20 text-lime-300 text-[10px] font-bold px-2 py-0.5 rounded-pill border border-lime-400/40">
                PRO 2.0
              </span>
            </div>
            <p className="text-[11px] text-sage-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block animate-pulse" />
              Mandi & Route Intelligence Online
            </p>
          </div>
        </div>

        {/* Language Segmented Control & Close */}
        <div className="flex items-center gap-3">
          <div className="flex bg-forest-800 p-0.5 rounded-pill border border-forest-700 text-xs">
            {['EN', 'हिं', 'मर'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded-pill text-[11px] font-semibold transition-all ${
                  language === lang
                    ? 'bg-lime-400 text-forest-900 shadow-sm'
                    : 'text-sage-200 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-forest-800 text-sage-200 hover:text-white hover:bg-forest-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50/60">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[88%] ${isAi ? 'self-start' : 'self-end ml-auto'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-forest-700 text-lime-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isAi
                      ? 'bg-surface-0 text-ink-900 border border-line-200 rounded-tl-sm'
                      : 'bg-forest-700 text-white rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className={`text-[10px] text-ink-400 mt-1 block ${isAi ? 'text-left' : 'text-right'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 max-w-[80%] self-start items-center">
            <div className="w-7 h-7 rounded-full bg-forest-700 text-lime-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-surface-0 border border-line-200 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="p-3 bg-surface-0 border-t border-line-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="px-3 py-1.5 rounded-pill bg-sage-100 hover:bg-lime-100 text-forest-800 text-xs font-semibold whitespace-nowrap transition-colors border border-line-200 shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-surface-0 border-t border-line-200">
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
              language === 'हिं'
                ? "CropSathi se bhav ya route puchein..."
                : "Ask CropSathi for prices, demand, or routes..."
            }
            className="flex-1 bg-cream-50 border border-line-200 rounded-pill px-4 py-2.5 text-xs sm:text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-surface-0 transition-all placeholder:text-ink-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-lime-400 hover:bg-lime-300 text-forest-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
