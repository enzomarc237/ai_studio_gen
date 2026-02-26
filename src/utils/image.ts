import { GoogleGenAI } from '@google/genai';

export const generateImage = async (prompt: string, size: string, aspectRatio: string, tier: 'free' | 'paid' = 'paid') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const model = tier === 'free' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
  const config: any = {
    imageConfig: {
      aspectRatio: aspectRatio,
    }
  };

  if (tier === 'paid') {
    config.imageConfig.imageSize = size;
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }],
    },
    config,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image generated');
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image generated');
};
