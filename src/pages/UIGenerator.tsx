import { useState, useRef } from 'react';
import { generateImage, editImage } from '../utils/image';
import { generateContent } from '../utils/ai';
import { useSettings } from '../context/SettingsContext';
import { Loader2, Image as ImageIcon, Upload, Key, Edit3, LayoutTemplate, Download } from 'lucide-react';
import MarkdownViewer from '../components/MarkdownViewer';

export default function UIGenerator() {
  const { settings } = useSettings();
  const [mode, setMode] = useState<'brand' | 'generate' | 'edit'>('brand');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [tier, setTier] = useState<'free' | 'paid'>('free');
  const [style, setStyle] = useState('wireframe');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [brandOutput, setBrandOutput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrandGen = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const systemInstruction = "You are an expert UI/UX designer and brand strategist. Generate a comprehensive brand identity including logos concepts, typography, color palettes (with hex codes), illustrations style, and abstract visual patterns based on the user's app idea. Format in Markdown.";
      const result = await generateContent(prompt, settings, systemInstruction, true);
      setBrandOutput(result || '');
    } catch (err) {
      console.error(err);
      alert('Failed to generate brand identity.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageGen = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      if (tier === 'paid') {
        if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
        }
      }
      let finalPrompt = prompt;
      if (style === 'wireframe') {
        finalPrompt = `A clean, low-fidelity UI wireframe mockup of ${prompt}. Black and white, simple lines, minimalist, structural layout.`;
      } else if (style === 'mockup') {
        finalPrompt = `A high-fidelity UI mockup of ${prompt}. Modern, clean, dribbble style, beautiful UI/UX, vibrant colors.`;
      } else if (style === 'logo') {
        finalPrompt = `A professional, modern logo design for ${prompt}. Clean vector style, flat design, isolated on white background.`;
      } else if (style === 'asset') {
        finalPrompt = `A beautiful brand illustration or graphic asset for ${prompt}. Modern corporate memphis or flat vector style, vibrant colors.`;
      }
      const img = await generateImage(finalPrompt, size, aspectRatio, tier);
      setImage(img);
    } catch (err) {
      console.error(err);
      alert('Failed to generate image. Ensure you have selected a valid API key if using paid tier.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageEdit = async () => {
    if (!prompt || !image) return;
    setLoading(true);
    try {
      const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
      const img = await editImage(prompt, image, mimeType);
      setImage(img);
    } catch (err) {
      console.error(err);
      alert('Failed to edit image.');
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
    <div className="flex h-full">
      <div className="w-1/3 border-r border-zinc-200 bg-white p-6 flex flex-col h-full overflow-y-auto">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">UI & Brand Generator</h2>
        
        <div className="flex space-x-2 mb-6 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('brand')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'brand' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Brand & UI
          </button>
          <button
            onClick={() => setMode('generate')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'generate' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Gen Image
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'edit' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Edit Image
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {mode === 'brand' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">App Idea / Vibe</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px]"
                  placeholder="Describe your app to generate brand guidelines..."
                />
              </div>
              <button
                onClick={handleBrandGen}
                disabled={loading || !prompt}
                className="w-full bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <LayoutTemplate className="h-5 w-5 mr-2" />}
                Generate Brand
              </button>
            </>
          )}

          {mode === 'generate' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Image Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  placeholder="A futuristic app interface..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none">
                    <option value="wireframe">Low-Fidelity Wireframe</option>
                    <option value="mockup">High-Fidelity Mockup</option>
                    <option value="logo">Logo Design</option>
                    <option value="asset">Brand Asset / Illustration</option>
                    <option value="custom">Custom (Use prompt as is)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Model Tier</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value as 'free' | 'paid')} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none">
                    <option value="free">Free (Flash)</option>
                    <option value="paid">Paid (Pro - High Quality)</option>
                  </select>
                </div>
                {tier === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none">
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                )}
                <div className={tier === 'free' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none">
                    {['1:1', '3:4', '4:3', '9:16', '16:9'].map(ar => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleImageGen}
                disabled={loading || !prompt}
                className="w-full bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <ImageIcon className="h-5 w-5 mr-2" />}
                Generate Image
              </button>
            </>
          )}

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Upload Image</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-300 rounded-xl py-8 flex flex-col items-center justify-center text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span>Click to upload image</span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Edit Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  placeholder="Add a retro filter..."
                />
              </div>
              <button
                onClick={handleImageEdit}
                disabled={loading || !prompt || !image}
                className="w-full bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Edit3 className="h-5 w-5 mr-2" />}
                Edit Image
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-zinc-50 h-full overflow-y-auto p-8 flex flex-col items-center justify-center">
        {mode === 'brand' ? (
          brandOutput ? (
            <div className="w-full max-w-3xl h-full">
              <MarkdownViewer content={brandOutput} title="Brand Guidelines" />
            </div>
          ) : (
            <div className="text-zinc-400 text-center">
              <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Generated brand guidelines will appear here</p>
            </div>
          )
        ) : (
          image ? (
            <div className="relative group max-w-full max-h-full flex items-center justify-center">
              <img src={image} alt="Generated" className="max-w-full max-h-full rounded-2xl shadow-md object-contain" />
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = image;
                  link.download = 'generated-image.png';
                  link.click();
                }}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur border border-zinc-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-zinc-700 hover:text-indigo-600"
                title="Download Image"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="text-zinc-400 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Generated or uploaded image will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
