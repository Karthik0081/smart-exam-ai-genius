
// Store API configuration and keys
const API_KEYS = {
  openai: '',
  gemini: ''
};

// Get API key from localStorage or return the default
export const getApiKey = (service: keyof typeof API_KEYS): string => {
  const storedKey = localStorage.getItem(`smartex-${service}-key`);
  return storedKey || API_KEYS[service];
};

// Save API key to localStorage
export const saveApiKey = (service: keyof typeof API_KEYS, key: string): void => {
  localStorage.setItem(`smartex-${service}-key`, key);
};

// Check if API key exists
export const hasApiKey = (service: keyof typeof API_KEYS): boolean => {
  return !!getApiKey(service);
};

// Clear API key
export const clearApiKey = (service: keyof typeof API_KEYS): void => {
  localStorage.removeItem(`smartex-${service}-key`);
};

// For development purposes, initialize with the provided key
// In production, this would be handled via proper authentication and secure storage
if (import.meta.env.DEV) {
  // This will run only in development
  const existingOpenAIKey = localStorage.getItem('smartex-openai-key');
  if (!existingOpenAIKey) {
    localStorage.setItem('smartex-openai-key', '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');
  }
}
