import { WordPair } from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'peppa_match_progress_v1',
  REVIEW: 'peppa_match_review_list_v1'
};

interface ProgressData {
  [key: string]: number; // Key (e.g., 'N5') -> Win Count
}

export const getProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveProgress = (key: string) => {
  try {
    const current = getProgress();
    const newCount = (current[key] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify({
      ...current,
      [key]: newCount
    }));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const getReviewList = (): WordPair[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEW);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addToReviewList = (newMistakes: WordPair[]) => {
  try {
    const currentList = getReviewList();
    // Avoid duplicates based on Japanese text
    const existingTexts = new Set(currentList.map(item => item.jp.text));
    
    const uniqueNew = newMistakes.filter(item => !existingTexts.has(item.jp.text));
    
    if (uniqueNew.length > 0) {
      const updatedList = [...currentList, ...uniqueNew];
      localStorage.setItem(STORAGE_KEYS.REVIEW, JSON.stringify(updatedList));
    }
  } catch (e) {
    console.error("Failed to update review list", e);
  }
};

export const removeFromReviewList = (pairIdsToRemove: string[]) => {
  // Actually, pair IDs are dynamic per game generation. 
  // We should remove by Content (Japanese Text) when a user successfully matches them in Review Mode.
  // However, linking "Game Card ID" back to "Storage Item" is tricky if IDs change.
  // For simplicity: We will rely on a separate method `removeReviewItemsByText`.
};

export const removeReviewItemsByText = (jpTexts: string[]) => {
  try {
    const currentList = getReviewList();
    const textsToRemove = new Set(jpTexts);
    const updatedList = currentList.filter(item => !textsToRemove.has(item.jp.text));
    localStorage.setItem(STORAGE_KEYS.REVIEW, JSON.stringify(updatedList));
  } catch (e) {
    console.error("Failed to clean review list", e);
  }
};