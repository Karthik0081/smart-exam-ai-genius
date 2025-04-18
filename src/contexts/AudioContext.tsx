
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AudioContextType = {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  voiceOptions: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  setCurrentVoice: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
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
  const [voiceOptions, setVoiceOptions] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  
  // Initialize speech synthesis voices
  useEffect(() => {
    const initVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setVoiceOptions(voices);
        
        // Try to find a female English voice
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && voice.name.includes('Female')
        ) || voices[0];
        
        if (englishVoice) {
          setCurrentVoice(englishVoice);
        }
      }
    };
    
    // Chrome loads voices asynchronously
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.getVoices().length > 0) {
        initVoices();
      }
      
      window.speechSynthesis.onvoiceschanged = initVoices;
    }
    
    // Cleanup
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  // Function to speak text
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      stopSpeaking();
      
      // Create new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if available
      if (currentVoice) {
        utterance.voice = currentVoice;
      }
      
      // Set speech parameters
      utterance.rate = rate;
      utterance.pitch = pitch;
      
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
    voiceOptions,
    currentVoice,
    setCurrentVoice,
    rate,
    setRate,
    pitch,
    setPitch
  };
  
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
