import { useCallback, useEffect, useRef } from 'react';

export function useSpeech() {
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if (!speechSynthesisRef.current) return;
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    if (options) {
      Object.assign(utterance, options);
    }

    utteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  }, []);

  const speakRepeated = useCallback((text: string, intervalMs = 3000) => {
    speak(text);
    const timer = setInterval(() => {
      speak(text);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [speak]);

  const stop = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  }, []);

  return { speak, speakRepeated, stop };
}
