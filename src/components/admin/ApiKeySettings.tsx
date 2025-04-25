
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Key, Eye, EyeOff, CheckCircle, Save } from 'lucide-react';
import { getApiKey, saveApiKey, hasApiKey, clearApiKey } from '@/utils/apiConfig';

export default function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);
  
  useEffect(() => {
    // Check if the API key is set
    const hasKey = hasApiKey('openai');
    setIsKeySet(hasKey);
    
    if (hasKey) {
      const key = getApiKey('openai');
      // Only show first 8 chars and last 4 chars of the key
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setApiKey(showKey ? key : maskedKey);
    }
  }, [showKey]);
  
  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    try {
      saveApiKey('openai', apiKey.trim());
      setIsKeySet(true);
      setShowKey(false);
      toast.success('API key saved successfully');
    } catch (error) {
      toast.error('Failed to save API key');
      console.error('Error saving API key:', error);
    }
  };
  
  const handleClearKey = () => {
    try {
      clearApiKey('openai');
      setApiKey('');
      setIsKeySet(false);
      toast.success('API key removed');
    } catch (error) {
      toast.error('Failed to remove API key');
      console.error('Error removing API key:', error);
    }
  };
  
  const toggleShowKey = () => {
    if (!isKeySet) return;
    
    if (!showKey) {
      // When showing the key, get the actual value
      const key = getApiKey('openai');
      setApiKey(key);
    } else {
      // When hiding, mask the key
      const key = getApiKey('openai');
      const maskedKey = key.length > 12 
        ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
        : '****';
      setApiKey(maskedKey);
    }
    
    setShowKey(!showKey);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2" size={20} />
          API Key Configuration
        </CardTitle>
        <CardDescription>
          Configure your OpenAI API key for AI question generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 mb-4">
          <p><strong>Important:</strong> Your API key is stored securely in your browser's local storage. 
          It will only be used for generating questions and extracting topics from documents.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="pr-10"
              />
              {isKeySet && (
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={toggleShowKey}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
          {isKeySet && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <CheckCircle size={14} className="mr-1" /> API key is configured
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearKey} disabled={!isKeySet}>
          Remove Key
        </Button>
        <Button onClick={handleSaveKey}>
          <Save size={18} className="mr-2" /> Save API Key
        </Button>
      </CardFooter>
    </Card>
  );
}
