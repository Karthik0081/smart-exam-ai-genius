
import { createContext, useContext, useState, ReactNode } from 'react';

type AudioContextType = {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
};

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Function to speak text
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      stopSpeaking();
      
      // Create new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice (optional)
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a female English voice (common in most systems)
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && voice.name.includes('Female')
        ) || voices[0];
        utterance.voice = englishVoice;
      }
      
      // Set speech parameters
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      
      // Add event listeners
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  };
  
  // Function to stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const value = {
    speak,
    stopSpeaking,
    isSpeaking,
  };
  
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
