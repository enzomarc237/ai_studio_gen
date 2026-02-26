import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { generateContent } from '../utils/ai';
import { Loader2, Lightbulb, Plus, Trash2 } from 'lucide-react';
import MarkdownViewer from '../components/MarkdownViewer';

export default function Brainstorm() {
  const { settings } = useSettings();
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<{ id: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateIdeas = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const systemInstruction = "You are a creative brainstorming assistant. Generate 5 unique, innovative, and actionable ideas based on the user's topic. Format each idea as a short paragraph with a bold title.";
      const result = await generateContent(topic, settings, systemInstruction, false);
      if (result) {
        setIdeas([{ id: crypto.randomUUID(), content: result }, ...ideas]);
        setTopic('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate ideas. Check your API settings.');
    } finally {
      setLoading(false);
    }
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter((i) => i.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center">
          <Lightbulb className="h-8 w-8 mr-3 text-amber-500" />
          Idea Generator
        </h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-8 flex gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
          placeholder="Enter a topic, problem, or industry to brainstorm about..."
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow text-zinc-900"
        />
        <button
          onClick={handleGenerateIdeas}
          disabled={loading || !topic}
          className="bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center hover:bg-zinc-800 transition-colors shadow-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          Generate Ideas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-8">
        {ideas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400">
            <Lightbulb className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Enter a topic above to start brainstorming</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 relative group">
              <button
                onClick={() => removeIdea(idea.id)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="pr-12">
                <MarkdownViewer content={idea.content} title="Brainstorming Ideas" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
