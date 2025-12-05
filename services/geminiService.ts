import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameConfig, JLPTLevel, WordPair } from "../types";

// Safety check to avoid "process is not defined" error in browsers
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const THEMES = [
  "Daily Life", "Travel & Transport", "School & Education", "Nature & Animals", 
  "Food & Cooking", "Business & Work", "Emotions & Personality", "House & Home",
  "Shopping", "Health & Body", "Weather", "Hobbies & Sports"
];

export const generateWordPairs = async (config: GameConfig): Promise<WordPair[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("No API Key found, using fallback data.");
    return getFallbackData();
  }

  const model = "gemini-2.5-flash";
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  let prompt = `Generate 7 pairs of Japanese-Chinese words/phrases for a vocabulary game.
  Theme: ${randomTheme} (Try to stick to this theme for variety).
  IMPORTANT: Do NOT use very common words like "Taberu" (Eat) or "Miru" (See) unless absolutely necessary. Randomize the vocabulary choice.
  `;
  
  if (config.conjugations && config.conjugations.length > 0) {
    const conjugationList = config.conjugations.join(", ");
    prompt += `
    Task: Japanese VERB CONJUGATION practice.
    Conjugate verbs into these specific forms: ${conjugationList}.
    If multiple forms are selected, mix them up randomly.
    The Chinese translation must accurately reflect the conjugation nuance (e.g., Passive "被...", Causative "让...", Potential "能...").`;
  } else {
    prompt += `
    Difficulty Level: ${config.level || JLPTLevel.N5}.
    Include a mix of Nouns, Verbs, and Adjectives.`;
  }

  prompt += `
  OUTPUT FORMAT REQUIREMENT:
  For the Japanese word, split it into segments to strictly align Kanji with its Furigana.
  Example for '食べない': 
  Segment 1: text='食', furigana='た'
  Segment 2: text='べない', furigana='' (Empty because it is Hiragana)
  
  Example for '学生':
  Segment 1: text='学', furigana='がく'
  Segment 2: text='生', furigana='せい'
  
  Ensure correct segmentation. Pure Kana words have 1 segment with no furigana.
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
              text: { type: Type.STRING, description: "The character(s)" },
              furigana: { type: Type.STRING, description: "Reading in Hiragana. Empty if not needed." }
            },
            required: ["text"]
          }
        },
        chinese: { type: Type.STRING, description: "Chinese translation" },
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
        temperature: 0.9, // Higher temperature for more randomness
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response from Gemini");

    const rawData = JSON.parse(jsonStr);

    // Transform to our app's internal format
    return rawData.map((item: any, index: number) => {
      // Reconstruct full text for speech
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
    console.error("Gemini generation failed:", error);
    return getFallbackData();
  }
};

// Fallback data in case API fails
const getFallbackData = (): WordPair[] => {
  return [
    { 
      id: '1', 
      jp: { 
        text: '猫', 
        segments: [{ text: '猫', furigana: 'ねこ' }] 
      }, 
      cn: '猫' 
    },
    { 
      id: '2', 
      jp: { 
        text: '新しい', 
        segments: [{ text: '新', furigana: 'あたら' }, { text: 'しい' }] 
      }, 
      cn: '新的' 
    },
    { 
      id: '3', 
      jp: { 
        text: '勉強する', 
        segments: [{ text: '勉', furigana: 'べん' }, { text: '強', furigana: 'きょう' }, { text: 'する' }] 
      }, 
      cn: '学习' 
    },
    { 
      id: '4', 
      jp: { 
        text: '行かない', 
        segments: [{ text: '行', furigana: 'い' }, { text: 'かない' }] 
      }, 
      cn: '不去' 
    },
    { 
      id: '5', 
      jp: { 
        text: '読める', 
        segments: [{ text: '読', furigana: 'よ' }, { text: 'める' }] 
      }, 
      cn: '能读' 
    },
    { 
      id: '6', 
      jp: { 
        text: '書かせる', 
        segments: [{ text: '書', furigana: 'か' }, { text: 'かせる' }] 
      }, 
      cn: '让写' 
    },
    { 
      id: '7', 
      jp: { 
        text: '飲まれる', 
        segments: [{ text: '飲', furigana: 'の' }, { text: 'まれる' }] 
      }, 
      cn: '被喝' 
    },
  ];
};