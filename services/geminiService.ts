import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameConfig, JLPTLevel, WordPair } from "../types";

const THEMES = [
  "Daily Life", "Travel", "School", "Animals", 
  "Food", "Work", "Home", "Shopping", "Weather", "Sports"
];

// Lazy initialization logic moved inside the function to prevent top-level crashes
export const generateWordPairs = async (config: GameConfig): Promise<WordPair[]> => {
  // Vite replaces process.env.API_KEY with the string value at build time
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No API Key found. Using Offline Mode.");
    return getFallbackData();
  }

  // Initialize AI instance strictly when needed
  const ai = new GoogleGenAI({ apiKey });

  const model = "gemini-2.5-flash";
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  let prompt = `Generate 7 pairs of Japanese-Chinese words.
  Theme: ${randomTheme}.
  Avoid simple words like "Taberu" or "Miru".
  `;
  
  if (config.conjugations && config.conjugations.length > 0) {
    const conjugationList = config.conjugations.join(", ");
    prompt += `
    Task: Japanese VERB CONJUGATION.
    Forms: ${conjugationList}.
    Mix forms randomly.
    Chinese must match the nuance.`;
  } else {
    prompt += `
    Level: ${config.level || JLPTLevel.N5}.
    Mix Nouns, Verbs, Adjectives.`;
  }

  prompt += `
  OUTPUT FORMAT:
  Split Japanese into segments to align Furigana ONLY above Kanji.
  Example '食べない': 
  Seg1: text='食', furigana='た'
  Seg2: text='べない', furigana=''
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        segments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              furigana: { type: Type.STRING }
            },
            required: ["text"]
          }
        },
        chinese: { type: Type.STRING },
      },
      required: ["segments", "chinese"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.9,
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response");

    const rawData = JSON.parse(jsonStr);

    return rawData.map((item: any, index: number) => {
      const fullText = item.segments.map((s: any) => s.text).join("");
      return {
        id: `pair-${Date.now()}-${index}`,
        jp: {
          text: fullText,
          segments: item.segments.map((s: any) => ({
             text: s.text,
             furigana: s.furigana || undefined
          }))
        },
        cn: item.chinese
      };
    });

  } catch (error) {
    console.error("Gemini failed, using fallback:", error);
    return getFallbackData();
  }
};

const getFallbackData = (): WordPair[] => {
  return [
    { 
      id: '1', 
      jp: { text: '猫', segments: [{ text: '猫', furigana: 'ねこ' }] }, 
      cn: '猫' 
    },
    { 
      id: '2', 
      jp: { text: '新しい', segments: [{ text: '新', furigana: 'あたら' }, { text: 'しい' }] }, 
      cn: '新的' 
    },
    { 
      id: '3', 
      jp: { text: '勉強', segments: [{ text: '勉', furigana: 'べん' }, { text: '強', furigana: 'きょう' }] }, 
      cn: '学习' 
    },
    { 
      id: '4', 
      jp: { text: '行かない', segments: [{ text: '行', furigana: 'い' }, { text: 'かない' }] }, 
      cn: '不去' 
    },
    { 
      id: '5', 
      jp: { text: '読める', segments: [{ text: '読', furigana: 'よ' }, { text: 'める' }] }, 
      cn: '能读' 
    },
    { 
      id: '6', 
      jp: { text: '書かせる', segments: [{ text: '書', furigana: 'か' }, { text: 'かせる' }] }, 
      cn: '让写' 
    },
    { 
      id: '7', 
      jp: { text: '飲まれる', segments: [{ text: '飲', furigana: 'の' }, { text: 'まれる' }] }, 
      cn: '被喝' 
    },
  ];
};