import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export const generateContent = async (
  prompt: string,
  settings: { provider: string; api_key: string; model: string },
  systemInstruction?: string,
  thinking?: boolean
) => {
  const { provider, api_key, model } = settings;

  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: api_key || process.env.GEMINI_API_KEY || '' });
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (thinking) config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };

    const response = await ai.models.generateContent({
      model: model || (thinking ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview'),
      contents: prompt,
      config,
    });
    return response.text;
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error('OpenAI API error');
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3-opus',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error('OpenRouter API error');
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === 'ollama') {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3',
        prompt: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}`,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error('Ollama API error');
    const data = await res.json();
    return data.response;
  }

  throw new Error('Unsupported provider');
};
