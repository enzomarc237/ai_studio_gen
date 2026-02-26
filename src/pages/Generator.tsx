import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { generateContent } from '../utils/ai';
import { Loader2, Download, Save, FileText, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';

export default function Generator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const docId = searchParams.get('id');
  const typeParam = searchParams.get('type') || 'prd';

  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [type, setType] = useState(typeParam);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (docId) {
      fetch(`/api/documents/${docId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (data && data.title) {
            setTitle(data.title);
            setContent(data.content);
            setType(data.type);
          }
        })
        .catch(() => {});
    }
  }, [docId]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const systemInstruction = `You are an expert product manager and software architect. Generate a comprehensive ${type.toUpperCase()} based on the user's idea. Format the output in Markdown.`;
      const result = await generateContent(prompt, settings, systemInstruction, true);
      setContent(result || '');
    } catch (err) {
      console.error(err);
      alert('Failed to generate content. Check your API settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const method = docId ? 'PUT' : 'POST';
      const url = docId ? `/api/documents/${docId}` : '/api/documents';
      const newId = docId || crypto.randomUUID();
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, title, type, content }),
      });
      if (!res.ok) throw new Error('Failed to save');
      
      setSuccess('Document saved successfully');
      setTimeout(() => setSuccess(''), 3000);
      if (!docId) navigate(`/app/generator?id=${newId}`, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const exportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${title}.md`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content.replace(/#/g, ''), 180);
    doc.text(lines, 10, 10);
    doc.save(`${title}.pdf`);
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: content.split('\\n').map(line => new Paragraph({ children: [new TextRun(line)] })),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel: Input */}
      <div className="w-1/3 border-r border-zinc-200 bg-white p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Document Generator</h2>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Document Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-zinc-50"
            >
              <option value="prd">PRD (Product Requirements Document)</option>
              <option value="specs">Technical Specifications</option>
              <option value="design">Design Document</option>
              <option value="plans">Project Plan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Idea / Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-zinc-50 min-h-[200px] resize-y"
              placeholder="Describe your app idea..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />}
            Generate {type.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 flex flex-col bg-zinc-50 h-full">
        <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center sticky top-0 z-10">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold text-zinc-900 bg-transparent border-none focus:ring-0 outline-none w-1/2"
          />
          <div className="flex items-center space-x-3">
            {success && <span className="text-emerald-600 text-sm flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Saved</span>}
            <button onClick={handleSave} disabled={saving || !content} className="text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors flex items-center font-medium disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </button>
            <div className="relative group">
              <button disabled={!content} className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg flex items-center hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button onClick={exportMarkdown} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 rounded-t-xl">Markdown (.md)</button>
                <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600">PDF (.pdf)</button>
                <button onClick={exportDOCX} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 rounded-b-xl">Word (.docx)</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {content ? (
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-zinc-100 prose prose-zinc max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Generated content will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
