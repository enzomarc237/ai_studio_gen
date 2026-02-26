import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [models, setModels] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSettings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSettings(localSettings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchModels = async () => {
    setFetching(true);
    setError('');
    setModels([]);
    try {
      let fetchedModels: string[] = [];
      const { provider, api_key } = localSettings;

      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${api_key}` },
        });
        if (!res.ok) throw new Error('Failed to fetch OpenAI models');
        const data = await res.json();
        fetchedModels = data.data.map((m: any) => m.id);
      } else if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { Authorization: `Bearer ${api_key}` },
        });
        if (!res.ok) throw new Error('Failed to fetch OpenRouter models');
        const data = await res.json();
        fetchedModels = data.data.map((m: any) => m.id);
      } else if (provider === 'gemini') {
        // We use the REST API to fetch models for Gemini
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${api_key}`);
        if (!res.ok) throw new Error('Failed to fetch Gemini models');
        const data = await res.json();
        fetchedModels = data.models.map((m: any) => m.name.replace('models/', ''));
      } else if (provider === 'ollama') {
        const res = await fetch('http://localhost:11434/api/tags');
        if (!res.ok) throw new Error('Failed to fetch Ollama models');
        const data = await res.json();
        fetchedModels = data.models.map((m: any) => m.name);
      }

      setModels(fetchedModels);
      if (fetchedModels.length > 0 && !localSettings.model) {
        setLocalSettings({ ...localSettings, model: fetchedModels[0] });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-8">Settings</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">AI Provider Configuration</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100">
            <AlertCircle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 mr-3" />
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Provider</label>
            <select
              value={localSettings.provider}
              onChange={(e) => setLocalSettings({ ...localSettings, provider: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-zinc-50"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          {localSettings.provider !== 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">API Key</label>
              <input
                type="password"
                value={localSettings.api_key}
                onChange={(e) => setLocalSettings({ ...localSettings, api_key: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono text-sm"
                placeholder="Enter your API key"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-zinc-700">Model</label>
              <button
                onClick={fetchModels}
                disabled={fetching || (!localSettings.api_key && localSettings.provider !== 'ollama')}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-medium disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${fetching ? 'animate-spin' : ''}`} />
                Fetch Models
              </button>
            </div>
            {models.length > 0 ? (
              <select
                value={localSettings.model}
                onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-zinc-50 font-mono text-sm"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={localSettings.model}
                onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono text-sm"
                placeholder="e.g., gemini-3.1-pro-preview"
              />
            )}
          </div>

          <div className="pt-6 border-t border-zinc-100 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center hover:bg-zinc-800 transition-colors shadow-sm font-medium"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
