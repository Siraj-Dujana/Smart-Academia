import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import Components
import Header from "../components/sections/LandingPage/Header";
import Footer from "../components/sections/LandingPage/Footer";
import HeroSection from "../components/sections/LandingPage/HeroSection";
import ProblemSection from "../components/sections/LandingPage/ProblemSection";
import FeaturesSection from "../components/sections/LandingPage/FeaturesSection";
import BenefitsSection from "../components/sections/LandingPage/BenefitsSection";
import HowItWorksSection from "../components/sections/LandingPage/HowItWorksSection";
import CTASection from "../components/sections/LandingPage/CTASection";

// Chatbot Button Component - HeroSection themed
const ChatbotButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#ffffff", opacity: 0.15 }} />
        
        <div 
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
            isHovered ? 'scale-110 shadow-2xl' : 'scale-100 shadow-lg'
          }`}
          style={{ 
            background: "linear-gradient(135deg, #ffffff, #ffffff)",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.15)"
          }}
        >
          <svg 
            className={`w-4 h-4 text-black transition-transform duration-300 ${
              isHovered ? 'rotate-12' : 'rotate-0'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          <span className="text-sm font-bold text-black">Chat</span>
          
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#6366f1" }}></span>
          </span>
        </div>
      </div>
    </button>
  );
};

// Gemini Chatbot Component - HeroSection Themed
const GeminiChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/ai/public-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages
            .filter(m => m.type !== 'bot' || m.text !== 'Hello! How can I help you?')
            .map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: data.reply
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: data.message || "I'm not sure how to respond. Can you rephrase?"
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: error.message || "Having trouble connecting. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    { text: 'What is Smart Academia?', id: 'about' },
    { text: 'Features', id: 'features' },
    { text: 'How it works', id: 'how-it-works' },
  ];

  // Markdown components with HeroSection theme styling
  const markdownComponents = {
    h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-0.5">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xs font-bold text-gray-200 mb-0.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-300 mb-0.5">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xs font-semibold text-gray-400 mb-0.5">{children}</h4>,
    h5: ({ children }) => <h5 className="text-xs font-medium text-gray-400 mb-0.5">{children}</h5>,
    h6: ({ children }) => <h6 className="text-xs font-medium text-gray-500 mb-0.5">{children}</h6>,
    
    p: ({ children }) => <p className="text-xs text-gray-200 leading-relaxed mb-0.5">{children}</p>,
    
    ul: ({ children }) => <ul className="list-disc pl-3 space-y-0.5 text-xs text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-3 space-y-0.5 text-xs text-gray-200">{children}</ol>,
    li: ({ children }) => <li className="text-xs text-gray-200 leading-relaxed">{children}</li>,
    
    code: ({ className, children, inline }) => {
      if (inline) {
        return <code className="px-1 py-0.5 rounded bg-gray-800 text-xs text-indigo-300 font-mono">{children}</code>;
      }
      return (
        <pre className="bg-gray-800 rounded p-2 my-1 overflow-x-auto border border-gray-700">
          <code className="text-xs text-green-300 font-mono">{children}</code>
        </pre>
      );
    },
    
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-indigo-400 pl-2 my-1 text-xs text-gray-400 italic">
        {children}
      </blockquote>
    ),
    
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 underline text-xs">
        {children}
      </a>
    ),
    
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    
    hr: () => <hr className="border-gray-700 my-1" />,
    
    table: ({ children }) => (
      <table className="min-w-full border-collapse my-1 text-xs">
        {children}
      </table>
    ),
    thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-700">{children}</tr>,
    th: ({ children }) => <th className="px-2 py-1 text-left text-white font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-2 py-1 text-gray-300">{children}</td>,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-72 sm:w-80 h-[420px] rounded-xl shadow-2xl overflow-hidden animate-slideInUp" style={{ background: "#0c0e1e", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
      <div className="w-full h-full flex flex-col">
        {/* Header - HeroSection themed */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#0c0e1e" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-black">AI Assistant</span>
              <span className="ml-2 text-[10px] text-black/50">Gemini</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-black/50 hover:text-black transition-colors p-1 rounded-full hover:bg-black/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Messages - HeroSection dark theme */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ background: "#0c0e1e" }}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.type === 'bot' && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}>
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              )}

              <div 
                className={`px-3 py-2 rounded-xl max-w-[80%]  ${
                  msg.type === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}
                style={{ 
                  background: msg.type === 'user' 
                    ? "linear-gradient(135deg, #ffffff, #ffffff)" 
                    : "#1e293b",
                  border: msg.type === 'bot' ? "1px solid rgba(255, 255, 255, 0.06)" : "none"
                }}
              >
                {msg.type === 'user' ? (
                  <p className="text-xs text-black whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                ) : (
                  <div className="text-xs text-gray-200 prose prose-invert prose-xs max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}>
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="px-4 py-2 rounded-xl rounded-tl-none" style={{ background: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Replies - HeroSection themed */}
        {messages.length < 3 && (
          <div className="px-3 py-2 flex gap-2 flex-wrap flex-shrink-0" style={{ background: "#0c0e1e", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => {
                  setInput(reply.text);
                  setTimeout(sendMessage, 100);
                }}
                className="px-3 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105"
                style={{ 
                  background: "#1e293b",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}
        
        {/* Input - HeroSection themed */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: "rgba(255, 255, 255, 0.06)", background: "#0c0e1e" }}>
          <div className="flex items-center gap-2">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Ask Me..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-indigo-400"
              style={{ background: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.06)" }}
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              className={`p-2 rounded-xl transition-all hover:scale-105 ${
                !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ background: "linear-gradient(135deg, #ffffff, #ffffff)" }}
              disabled={!input.trim() || isLoading}
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 50);
      
      if (mobileMenuOpen && window.innerWidth < 1024) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.substring(1);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden pt-16 sm:pt-20" style={{ background: "#0c0e1e", fontFamily: "'Lexend', sans-serif" }}>
      
      <style>
        {`
          /* Custom scrollbar - White */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #ffffff;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #e2e8f0;
          }
          
          /* For Firefox */
          * {
            scrollbar-width: thin;
            scrollbar-color: #ffffff #1e293b;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }

          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
        `}
      </style>
      
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogin={() => handleNavigate("/login")}
        onRegister={() => handleNavigate("/register")}
        isScrolled={isScrolled}
        onNavClick={scrollToSection}
      />

      <main className="overflow-x-hidden animate-fadeIn">
        <HeroSection onButtonClick={() => handleNavigate("/register")} />
        
        <div id="problem">
          <ProblemSection />
        </div>
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <div id="benefits">
          <BenefitsSection />
        </div>
        
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        
        <CTASection
          primaryButton={{ text: "Get Started", onClick: () => handleNavigate("/register") }}
          secondaryButton={{ text: "Login to Account", onClick: () => handleNavigate("/login") }}
        />
      </main>

      <Footer />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
          style={{ 
            background: "linear-gradient(135deg, #ffffff, #ffffff)",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.15)"
          }}
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <ChatbotButton onClick={toggleChatbot} />
      <GeminiChatbot isOpen={showChatbot} onClose={toggleChatbot} />
    </div>
  );
};

export default LandingPage;