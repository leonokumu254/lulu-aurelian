import React, { useEffect, useState } from 'react';
import './Preloader.css';

const FULL_TEXT = 'LuLu Aurelian';
const TAGLINE = 'curated spaces · seamless living';

export default function Preloader({ onComplete }) {
  const [charIndex, setCharIndex] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Lock document scroll while preloader is active to eliminate all scrollbars
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Typewriter effect for brand name with delayed, deliberate cadence
  useEffect(() => {
    // Initial relaxed pause before typing starts (~380ms)
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCharIndex((prev) => {
          if (prev < FULL_TEXT.length) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 115); // Calm, luxurious typing speed (115ms per character)

      return () => clearInterval(interval);
    }, 380);

    return () => clearTimeout(startTimeout);
  }, []);

  // When brand typing finishes, pause briefly, reveal tagline, then hold before exit
  useEffect(() => {
    if (charIndex >= FULL_TEXT.length) {
      setIsTypingDone(true);

      // Brief breathing pause after typing brand name before tagline appears
      const taglineTimer = setTimeout(() => {
        setShowTagline(true);
      }, 350);

      // Generous hold time so guest/staff can comfortably absorb brand & tagline
      const holdTimer = setTimeout(() => {
        setIsExiting(true);
      }, 2100);

      return () => {
        clearTimeout(taglineTimer);
        clearTimeout(holdTimer);
      };
    }
  }, [charIndex]);

  // When exit begins, wait for smooth fade-out transition then call onComplete
  useEffect(() => {
    if (isExiting) {
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 750);

      return () => clearTimeout(exitTimer);
    }
  }, [isExiting, onComplete]);

  // Derive visible wordmark chunks
  const luluPart = FULL_TEXT.slice(0, Math.min(charIndex, 4));
  const hasSpace = charIndex >= 5;
  const aurelianPart = charIndex > 5 ? FULL_TEXT.slice(5, charIndex) : '';

  return (
    <div className={`pl-overlay ${isExiting ? 'pl-exit' : ''}`} aria-hidden="true">
      <div className="pl-brand">
        <h1 className="pl-wordmark">
          <span className="pl-lulu">{luluPart}</span>
          {hasSpace && <span className="pl-space">&nbsp;</span>}
          {aurelianPart && <span className="pl-aurelian">{aurelianPart}</span>}
          <span
            className={`pl-cursor ${isTypingDone ? 'pl-cursor-done' : ''}`}
            aria-hidden="true"
          />
        </h1>

        {/* Tagline: curated spaces · seamless living */}
        {showTagline && (
          <p className="pl-tagline">
            {TAGLINE}
          </p>
        )}
      </div>
    </div>
  );
}


