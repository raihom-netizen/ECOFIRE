
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function editImage(
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/png'
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1], // Remove the data:image/png;base64, prefix
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `You are a professional product photo editor. ${prompt}. Please provide the resulting edited image.`,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image data returned from AI");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The AI response did not contain an image.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
