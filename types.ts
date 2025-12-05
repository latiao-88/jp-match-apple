
import React from 'react';

export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum JLPTLevel {
  N5 = 'N5',
  N4 = 'N4',
  N3 = 'N3'
}

export enum ConjugationType {
  DICTIONARY = 'Dictionary',
  MASU = 'Masu',
  TE = 'Te',
  TA = 'Ta',
  NAI = 'Nai',
  POTENTIAL = 'Potential',
  VOLITIONAL = 'Volitional',
  PASSIVE = 'Passive',
  CAUSATIVE = 'Causative',
  IMPERATIVE = 'Imperative',
  PROHIBITIVE = 'Prohibitive',
  BA = 'Ba',
  CAUSATIVE_PASSIVE = 'CausativePassive'
}

export interface FuriganaSegment {
  text: string;
  furigana?: string;
}

export interface WordPair {
  id: string;
  jp: {
    text: string; // Full plain text for speech (e.g., "食べない")
    segments: FuriganaSegment[]; // For rendering specific furigana
  };
  cn: string;
}

export interface GameConfig {
  level?: JLPTLevel;
  conjugations?: ConjugationType[];
  isReviewMode?: boolean;
  reviewData?: WordPair[];
}

export interface CardItem {
  id: string;
  pairId: string; // Links JP and CN
  content: React.ReactNode;
  type: 'JP' | 'CN';
  textForSpeech?: string; // Only for JP
  isMatched: boolean;
  isSelected: boolean;
  isError: boolean;
}
