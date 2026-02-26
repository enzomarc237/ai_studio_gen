import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { generateContent } from '../utils/ai';
import { Loader2, Send, Bot, User, Upload, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function Chatbot() {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !image) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, image: image || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      let responseText = '';
      
      if (image && settings.provider === 'gemini') {
        // Image analysis with gemini-3.1-pro-preview
        const ai = new GoogleGenAI({ apiKey: settings.api_key || process.env.GEMINI_API_KEY || '' });
        const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: image.split(',')[1],
                  mimeType: mimeType,
                },
              },
              { text: input || 'Analyze this image.' },
            ],
          },
        });
        responseText = response.text || '';
      } else {
        // Normal chat
        // Use thinking mode if requested (we'll just use it by default for complex queries or if gemini is selected)
        const isGemini = settings.provider === 'gemini';
        responseText = await generateContent(
          input,
          settings,
          'You are a helpful AI assistant.',
          isGemini // enable thinking for gemini
        ) || '';
      }

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6 px-4">
        <Bot className="h-8 w-8 mr-3 text-emerald-500" />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AI Assistant</h1>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col mb-4">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <Bot className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">How can I help you today?</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600 ml-4' : 'bg-emerald-100 text-emerald-600 mr-4'}`}>
                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-xs rounded-lg mb-3" />
                    )}
                    <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'prose-zinc'} max-w-none text-sm`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 mr-4">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          {image && (
            <div className="mb-3 relative inline-block">
              <img src={image} alt="Preview" className="h-20 rounded-lg border border-zinc-200" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                &times;
              </button>
            </div>
          )}
          <div className="flex items-center bg-white rounded-2xl border border-zinc-200 p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-zinc-50"
              title="Upload Image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-zinc-900"
            />
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !image)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
