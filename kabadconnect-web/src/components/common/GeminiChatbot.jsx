import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  User, 
  CheckCheck, 
  Calendar, 
  ChevronRight, 
  HelpCircle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Wallet
} from 'lucide-react';

export const GeminiChatbot = ({ 
  onOpenBooking = () => {}, 
  onNavigate = () => {},
  currentUser = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 🌿 I am **KabadCollect EcoBot**, your AI recycling assistant powered by **Google Gemini**. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: [
        { label: '📈 Today\'s Scrap Rates', action: 'rates' },
        { label: '🚚 How to Book Pickup?', action: 'book_info' },
        { label: '💳 UPI & Eco Wallet Payout', action: 'payout' },
        { label: '🔒 Scale Weight Verification', action: 'scale_info' }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Handle local AI fallback response generator (Domain Knowledge Engine)
  const generateGeminiResponse = async (userQuery) => {
    const query = userQuery.toLowerCase();

    // Check if Gemini API key exists
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are KabadCollect EcoBot, a helpful, courteous AI assistant for KabadCollect (India's doorstep scrap pickup & hyperlocal recycling marketplace platform). Answer the user's question concisely, accurately, and enthusiastically using markdown formatting. User Question: ${userQuery}`
                }]
              }]
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) return candidateText;
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent domain fallback:', err);
      }
    }

    // Intelligent Domain Knowledge Fallback Logic
    if (query.includes('rate') || query.includes('price') || query.includes('cost') || query.includes('paper') || query.includes('metal') || query.includes('copper')) {
      return `### 📈 KabadCollect Live Scrap Rates (Today)

Here are the current market recycling benchmark prices:

- 📰 **Newspaper (Raddi)**: ₹16 - ₹18 / kg
- 📦 **Corrugated Cardboard (Gatta)**: ₹12 - ₹14 / kg
- 🧴 **PET Plastic Bottles**: ₹15 - ₹18 / kg
- 🔴 **Copper Cable / Wire**: ₹620 - ₹680 / kg
- 🟡 **Brass Scrap (Pital)**: ₹420 - ₹460 / kg
- ⚪ **Aluminum Utensils**: ₹140 - ₹160 / kg
- 💻 **E-Waste & Laptops**: ₹250 - ₹1,200 / unit
- 🧺 **Washing Machine / Fridge**: ₹800 - ₹2,500 / unit

*Want to estimate your full payout? Try our interactive Scrap Calculator!*`;
    }

    if (query.includes('book') || query.includes('schedule') || query.includes('pickup') || query.includes('how to')) {
      return `### 🚚 How Doorstep Pickup Works

1. **Select Items**: Tap **"Schedule Pickup"** on the website and choose your scrap categories.
2. **Choose Slot**: Pick your convenient date and morning/afternoon time window.
3. **Collector Arrives**: Our verified partner arrives at your doorstep with a **Bluetooth digital scale**.
4. **Instant Cash**: Verify the weight on your phone and receive **Instant UPI** or **Eco Wallet Payout**!

[CLICK_TO_BOOK_CTA]`;
    }

    if (query.includes('payout') || query.includes('wallet') || query.includes('upi') || query.includes('cash') || query.includes('money')) {
      return `### 💳 Instant Payout Options

KabadCollect provides 100% transparent and instant digital payouts:

- ⚡ **Instant UPI**: Direct credit to Google Pay, PhonePe, Paytm, or BHIM.
- 💵 **Doorstep Cash**: Physical cash handed over after scale verification.
- 🌿 **KabadCollect Eco Wallet**: Earn **5% Extra Bonus Green Coins** on every pickup!

You can manage your wallet and download green certificates directly in your **Profile Page**.`;
    }

    if (query.includes('scale') || query.includes('cheat') || query.includes('weight') || query.includes('honest') || query.includes('tamper')) {
      return `### 🔒 Anti-Fraud & Digital Scale Verification

Street collectors often cheat by 20-30% using uncalibrated mechanical spring scales. 

KabadCollect eliminates weight fraud:
- Every collector carries a **Government-Stamped Bluetooth Digital Scale**.
- Weights display live in real-time on your mobile screen.
- You receive a 4-digit SMS OTP to unlock payment only after you approve the final weight!`;
    }

    if (query.includes('bazaar') || query.includes('pre-loved') || query.includes('sell item') || query.includes('furniture')) {
      return `### 🛍️ Pre-Loved Bazaar

Have usable furniture, appliances, electronics, or bicycles in good condition? Don't sell them as scrap!

List them on **KabadCollect Pre-Loved Bazaar**:
- Free listing for local neighborhood buyers.
- Buyers contact you directly on WhatsApp.
- Earn 3x-5x higher value than scrap metal pricing!`;
    }

    if (query.includes('contact') || query.includes('support') || query.includes('phone') || query.includes('email') || query.includes('help')) {
      return `### 🎧 Customer Support & Help Desk

Need direct human assistance? We are available 7 days a week!

- 📞 **Toll-Free Helpline**: \`1800-KABAD-COLLECT\` (1800-522-2326)
- ✉️ **Support Email**: \`support@kabadcollect.in\`
- 💬 **WhatsApp**: \`+91 98100 23456\`
- 🕒 **Operating Hours**: 8:00 AM – 8:00 PM IST Daily

You can also submit a formal ticket on our **Contact & Support Hub** page!`;
    }

    // Default general response
    return `Thank you for asking! **KabadCollect** is India's leading hyperlocal doorstep scrap collection and recycling platform.

I can assist you with:
- 📈 Live Scrap Rates Today
- 🚚 Scheduling Doorstep Pickups
- ⚖️ Digital Scale Verification
- 💳 UPI & Eco Wallet Cash Payouts
- 🛍️ Buying & Selling on Pre-Loved Bazaar

Feel free to pick one of the quick options below or type your query!`;
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate intelligent processing response time
    setTimeout(async () => {
      const botResponseText = await generateGeminiResponse(text);
      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleChipClick = (chipAction) => {
    if (chipAction === 'rates') {
      onNavigate('rates');
      handleSendMessage('What are today\'s paper and metal scrap rates?');
    } else if (chipAction === 'book_info') {
      handleSendMessage('How do I schedule a doorstep pickup?');
    } else if (chipAction === 'payout') {
      handleSendMessage('How does instant UPI and Eco Wallet payout work?');
    } else if (chipAction === 'scale_info') {
      handleSendMessage('How do digital scales prevent weight cheating?');
    }
  };

  const renderFormattedText = (text) => {
    if (text.includes('[CLICK_TO_BOOK_CTA]')) {
      const parts = text.split('[CLICK_TO_BOOK_CTA]');
      return (
        <div>
          <div>{formatMarkdown(parts[0])}</div>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}
          >
            <Calendar size={14} /> Schedule Doorstep Pickup Now ➔
          </button>
        </div>
      );
    }
    return formatMarkdown(text);
  };

  const formatMarkdown = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      let formatted = line;

      // Handle bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (line.startsWith('### ')) {
        return <h4 key={i} style={{ margin: '0.4rem 0 0.25rem 0', color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: 800 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '1rem', marginBottom: '0.2rem' }}>{parts.length ? parts : line.replace('- ', '')}</li>;
      }

      return <p key={i} style={{ margin: '0 0 0.35rem 0', lineHeight: 1.45 }}>{parts.length ? parts : line}</p>;
    });
  };

  return (
    <>
      {/* Floating Chatbot Bubble Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #072e1c 0%, #10B981 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          className="hover-scale-btn"
          aria-label="Open Gemini AI Recycling Chatbot"
          title="Ask KabadCollect AI Assistant — Powered by Google Gemini"
        >
          <Bot size={28} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#F59E0B',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={10} color="#000000" />
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          width: 'clamp(320px, 90vw, 400px)',
          height: isMinimized ? '60px' : 'clamp(480px, 75vh, 600px)',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          animation: 'slideInUp 0.25s ease'
        }}>
          
          {/* Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '1px solid #34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="#34D399" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>KabadCollect EcoBot</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', color: '#FDE047' }}>
                    Gemini AI
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }} />
                  <span>Online 24/7 • Real-time AI Desk</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                aria-label="Minimize Chat"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Body (if not minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Scroll Area */}
              <div style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        maxWidth: '85%',
                        background: isUser ? 'var(--color-primary)' : '#FFFFFF',
                        color: isUser ? '#FFFFFF' : 'var(--color-text-primary)',
                        padding: '0.75rem 0.95rem',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        boxShadow: isUser ? '0 2px 8px rgba(13, 92, 58, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        border: isUser ? 'none' : '1px solid var(--color-border)',
                        fontSize: '0.85rem'
                      }}>
                        {renderFormattedText(msg.text)}
                      </div>

                      <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px', padding: '0 4px' }}>
                        {msg.time}
                      </div>

                      {/* Quick Chips if attached */}
                      {msg.chips && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.65rem' }}>
                          {msg.chips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleChipClick(chip.action)}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid var(--color-accent-mint)',
                                color: '#059669',
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-full)',
                                padding: '0.25rem 0.65rem',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-xs)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', padding: '0.5rem 0.85rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--color-border)' }}>
                    <Sparkles size={14} className="animate-spin" color="var(--color-primary)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Gemini AI is thinking...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Bar */}
              <div style={{
                padding: '0.4rem 0.75rem',
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}>
                {[
                  { label: '📅 Book Pickup', fn: () => { setIsOpen(false); onOpenBooking(); } },
                  { label: '📈 Check Rates', fn: () => handleSendMessage('What are today\'s scrap rates?') },
                  { label: '🎧 Support Ticket', fn: () => onNavigate('contact') }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.fn}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input Control Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: '0.65rem 0.75rem',
                  background: '#FFFFFF',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <input
                  type="text"
                  placeholder="Ask Gemini AI anything about scrap recycling..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: inputMessage.trim() ? 'var(--color-primary)' : '#CBD5E1',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputMessage.trim() ? 'pointer' : 'default',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </>
  );
};
