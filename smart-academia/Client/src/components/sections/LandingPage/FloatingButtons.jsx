import React, { useState } from 'react';

/**
 * FloatingButtons — persistent action cluster (AI Assistant + scroll-to-top).
 *
 * Design notes:
 * - The AI button carries a slow "breathing" ring, echoing the central glow
 *   orb in AIDashboard (HeroSection) — the same visual idea that represents
 *   the AI brain there now represents "AI is listening" here. That's the one
 *   signature flourish; everything else stays quiet.
 * - Labels slide out on hover instead of a stock browser tooltip, so the
 *   `chatTooltip` / `scrollTooltip` props actually get used.
 * - Colors follow the site's monochrome system: white on near-black glass,
 *   not a hardcoded indigo gradient.
 */
const FloatingButtons = ({
  showScrollTop,
  onScrollToTop,
  onChatClick,
  chatTooltip = "AI Assistant",
  scrollTooltip = "Scroll to top",
  chatIcon = "smart_toy",
  scrollIcon = "arrow_upward",
  chatPosition = "bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
  scrollPosition = "bottom-20 right-4 sm:bottom-24 sm:right-6 md:bottom-28 md:right-8",
}) => {
  const [chatHovered, setChatHovered] = useState(false);
  const [scrollHovered, setScrollHovered] = useState(false);

  return (
    <>
      <style>
        {`
          @keyframes fb-breathe {
            0%, 100% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.75; transform: scale(1.12); }
          }
          @keyframes fb-pop-in {
            from { opacity: 0; transform: translateY(8px) scale(0.85); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .fb-breathe { animation: fb-breathe 3.2s ease-in-out infinite; }
          .fb-pop-in { animation: fb-pop-in 0.25s ease-out; }
          @media (prefers-reduced-motion: reduce) {
            .fb-breathe { animation: none; opacity: 0.5; }
          }
        `}
      </style>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <div className={`fixed ${scrollPosition} z-40 fb-pop-in`}>
          <div className="relative flex items-center justify-end">
            {/* Slide-out label */}
            <span
              className={`absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 pointer-events-none ${
                scrollHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}
              style={{ background: "#0c0e1e", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {scrollTooltip}
            </span>

            <button
              onClick={onScrollToTop}
              onMouseEnter={() => setScrollHovered(true)}
              onMouseLeave={() => setScrollHovered(false)}
              aria-label={scrollTooltip}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "rgba(12,14,30,0.85)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <span className="material-symbols-outlined text-white text-lg">{scrollIcon}</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Button */}
      <div className={`fixed ${chatPosition} z-40`}>
        <div className="relative flex items-center justify-end">
          {/* Slide-out label */}
          <span
            className={`absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 pointer-events-none ${
              chatHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
            style={{ background: "#0c0e1e", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {chatTooltip}
          </span>

          {/* Breathing ring - signature element, echoes AIDashboard's glow orb */}
          <div
            className="absolute inset-0 rounded-full fb-breathe pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}
          />

          <button
            onClick={onChatClick}
            onMouseEnter={() => setChatHovered(true)}
            onMouseLeave={() => setChatHovered(false)}
            aria-label={chatTooltip}
            className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white"
            style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.45)" }}
          >
            <span className="material-symbols-outlined text-black text-2xl">{chatIcon}</span>
            {/* Live indicator dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#6366f1" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#6366f1", border: "2px solid #0c0e1e" }} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingButtons;