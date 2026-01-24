
import { GoogleGenAI, Type } from "@google/genai";

export class AyaEyeService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateMascot() {
    try {
      const prompt = "High-quality anime style cute cartoon cat-squirrel hybrid mascot character with a big fluffy tail, energetically playing a rock guitar where the neck is a sharp pirate cutlass sword, epic pose, vibrant colors, cinematic lighting, stylized background, high resolution.";
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("AyaEye Splash Generation Error:", error);
      return null;
    }
  }

  async generateDirectorMascot() {
    try {
      const prompt = "Cute anime cat-squirrel hybrid cartoon mascot character sitting comfortably in a wooden director's chair, holding a megaphone, wearing a small film director's hat, big expressive eyes, fluffy tail, vibrant colors, studio background, high quality character art, isolated on clean background.";
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("AyaEye Icon Generation Error:", error);
      return null;
    }
  }

  async generateSmartCaptions(base64Image: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Analyze this video frame and suggest 3 catchy, short captions for a social media post. Return as a JSON array of strings." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      return ["Cinematic Moment", "AyaEye View", "Masterpiece"];
    }
  }

  async describeScene(base64Image: string) {
     try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Analyze this frame. Describe the visual mood and lighting. Suggest a cinematic 'Look' name. Provide numeric color grading suggestions for: brightness, contrast, saturation, vibrancy, and gamma (relative to 100 as default). ALSO, suggest a genre and style of background music that would fit this scene, and a list of 3-5 specific sound effects (SFX) that would enhance this specific content. Return in JSON format." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mood: { type: Type.STRING },
                    lookName: { type: Type.STRING },
                    colorAdvice: { type: Type.STRING },
                    suggestedMusic: { type: Type.STRING },
                    suggestedSFX: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedFilters: {
                        type: Type.OBJECT,
                        properties: {
                            brightness: { type: Type.NUMBER },
                            contrast: { type: Type.NUMBER },
                            saturation: { type: Type.NUMBER },
                            vibrancy: { type: Type.NUMBER },
                            gamma: { type: Type.NUMBER }
                        }
                    }
                },
                required: ['mood', 'lookName', 'colorAdvice', 'suggestedFilters', 'suggestedMusic', 'suggestedSFX']
            }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      return null;
    }
  }

  async analyzeBackground(base64Image: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Identify the primary subject and determine its bounding box coordinates (x, y, width, height as percentages 0-100). Return in JSON format." },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    confidence: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    rect: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        w: { type: Type.NUMBER },
                        h: { type: Type.NUMBER }
                      },
                      required: ['x', 'y', 'w', 'h']
                    }
                },
                required: ['confidence', 'description', 'rect']
            }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return { confidence: 50, description: "Unknown Subject", rect: { x: 25, y: 25, w: 50, h: 50 } };
    }
  }

  async locateSubject(base64Image: string, description: string = "main moving subject") {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: `Locate the ${description} in this frame. Return its central X and Y coordinates as percentages (0-100) from the top-left corner. Return in JSON format.` },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            },
            required: ['x', 'y']
          }
        }
      });
      return JSON.parse(response.text || '{"x": 50, "y": 50}');
    } catch (error) {
      return { x: 50, y: 50 };
    }
  }
}

export const gemini = new AyaEyeService();
