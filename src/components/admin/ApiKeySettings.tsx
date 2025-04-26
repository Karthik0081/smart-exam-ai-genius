
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Key, Eye, EyeOff, CheckCircle, Save } from 'lucide-react';
import { getApiKey, saveApiKey, hasApiKey, clearApiKey } from '@/utils/apiConfig';

export default function ApiKeySettings() {
  const [activeTab, setActiveTab] = useState<'openai' | 'gemini'>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isOpenaiKeySet, setIsOpenaiKeySet] = useState(false);
  const [isGeminiKeySet, setIsGeminiKeySet] = useState(false);
  
  useEffect(() => {
    // Check if API keys are set
    const hasOpenaiKey = hasApiKey('openai');
    setIsOpenaiKeySet(hasOpenaiKey);
    
    const hasGeminiKey = hasApiKey('gemini');
    setIsGeminiKeySet(hasGeminiKey);
    
    if (hasOpenaiKey) {
      const key = getApiKey('openai');
      // Only show first 8 chars and last 4 chars of the key
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setOpenaiKey(showOpenaiKey ? key : maskedKey);
    }
    
    if (hasGeminiKey) {
      const key = getApiKey('gemini');
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setGeminiKey(showGeminiKey ? key : maskedKey);
    }
  }, [showOpenaiKey, showGeminiKey]);
  
  const handleSaveOpenaiKey = () => {
    if (!openaiKey.trim()) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }
    
    try {
      saveApiKey('openai', openaiKey.trim());
      setIsOpenaiKeySet(true);
      setShowOpenaiKey(false);
      toast.success('OpenAI API key saved successfully');
    } catch (error) {
      toast.error('Failed to save OpenAI API key');
      console.error('Error saving OpenAI API key:', error);
    }
  };
  
  const handleSaveGeminiKey = () => {
    if (!geminiKey.trim()) {
      toast.error('Please enter a valid Gemini API key');
      return;
    }
    
    try {
      saveApiKey('gemini', geminiKey.trim());
      setIsGeminiKeySet(true);
      setShowGeminiKey(false);
      toast.success('Gemini API key saved successfully');
    } catch (error) {
      toast.error('Failed to save Gemini API key');
      console.error('Error saving Gemini API key:', error);
    }
  };
  
  const handleClearOpenaiKey = () => {
    try {
      clearApiKey('openai');
      setOpenaiKey('');
      setIsOpenaiKeySet(false);
      toast.success('OpenAI API key removed');
    } catch (error) {
      toast.error('Failed to remove OpenAI API key');
      console.error('Error removing OpenAI API key:', error);
    }
  };
  
  const handleClearGeminiKey = () => {
    try {
      clearApiKey('gemini');
      setGeminiKey('');
      setIsGeminiKeySet(false);
      toast.success('Gemini API key removed');
    } catch (error) {
      toast.error('Failed to remove Gemini API key');
      console.error('Error removing Gemini API key:', error);
    }
  };
  
  const toggleShowOpenaiKey = () => {
    if (!isOpenaiKeySet) return;
    
    if (!showOpenaiKey) {
      const key = getApiKey('openai');
      setOpenaiKey(key);
    } else {
      const key = getApiKey('openai');
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setOpenaiKey(maskedKey);
    }
    
    setShowOpenaiKey(!showOpenaiKey);
  };
  
  const toggleShowGeminiKey = () => {
    if (!isGeminiKeySet) return;
    
    if (!showGeminiKey) {
      const key = getApiKey('gemini');
      setGeminiKey(key);
    } else {
      const key = getApiKey('gemini');
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setGeminiKey(maskedKey);
    }
    
    setShowGeminiKey(!showGeminiKey);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2" size={20} />
          API Keys Configuration
        </CardTitle>
        <CardDescription>
          Configure your AI API keys for question generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
          <p><strong>Important:</strong> Your API keys are stored securely in your browser's local storage. 
          They will only be used for generating questions and extracting topics from documents.</p>
        </div>
        
        <div className="flex border-b">
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'openai' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('openai')}
          >
            OpenAI
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'gemini' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('gemini')}
          >
            Gemini
          </button>
        </div>
        
        {activeTab === 'openai' && (
          <div className="space-y-2">
            <Label htmlFor="openaiKey">OpenAI API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="openaiKey"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="pr-10"
                />
                {isOpenaiKeySet && (
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={toggleShowOpenaiKey}
                  >
                    {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
            {isOpenaiKeySet && (
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle size={14} className="mr-1" /> OpenAI API key is configured
              </p>
            )}
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={handleClearOpenaiKey} disabled={!isOpenaiKeySet}>
                Remove Key
              </Button>
              <Button onClick={handleSaveOpenaiKey}>
                <Save size={18} className="mr-2" /> Save API Key
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'gemini' && (
          <div className="space-y-2">
            <Label htmlFor="geminiKey">Google Gemini API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="geminiKey"
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="pr-10"
                />
                {isGeminiKeySet && (
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={toggleShowGeminiKey}
                  >
                    {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
            {isGeminiKeySet && (
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle size={14} className="mr-1" /> Gemini API key is configured
              </p>
            )}
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={handleClearGeminiKey} disabled={!isGeminiKeySet}>
                Remove Key
              </Button>
              <Button onClick={handleSaveGeminiKey}>
                <Save size={18} className="mr-2" /> Save API Key
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
