
import React, { useEffect, useState } from 'react';
import { GameConfig, JLPTLevel, ConjugationType } from '../types';
import { Check, BookOpen, GraduationCap, Zap, Star, RefreshCw } from 'lucide-react';
import { getProgress, getReviewList } from '../services/storageService';

interface MenuScreenProps {
  onStart: (config: GameConfig) => void;
}

const CONJUGATION_LABELS: Record<ConjugationType, string> = {
  [ConjugationType.DICTIONARY]: "辞书形 (原形)",
  [ConjugationType.MASU]: "ます形 (敬语)",
  [ConjugationType.TE]: "て形 (连接/进行)",
  [ConjugationType.TA]: "た形 (过去)",
  [ConjugationType.NAI]: "ない形 (否定)",
  [ConjugationType.POTENTIAL]: "可能形 (能)",
  [ConjugationType.VOLITIONAL]: "意向形 (想)",
  [ConjugationType.IMPERATIVE]: "命令形 (命令)",
  [ConjugationType.PROHIBITIVE]: "禁止形 (禁止)",
  [ConjugationType.BA]: "ば形 (假设)",
  [ConjugationType.PASSIVE]: "受身形 (被动)",
  [ConjugationType.CAUSATIVE]: "使役形 (让)",
  [ConjugationType.CAUSATIVE_PASSIVE]: "使役被动 (被迫)",
};

const MenuScreen: React.FC<MenuScreenProps> = ({ onStart }) => {
  const [level, setLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const [selectedConjugations, setSelectedConjugations] = useState<ConjugationType[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    setProgress(getProgress());
    setReviewCount(getReviewList().length);
  }, []);

  const toggleConjugation = (type: ConjugationType) => {
    setSelectedConjugations(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleStart = () => {
    onStart({
      level,
      conjugations: selectedConjugations
    });
  };

  const handleReviewStart = () => {
    onStart({
      isReviewMode: true,
      reviewData: getReviewList().slice(0, 7) // Take first 7 items for a session
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6 pb-12">
      {/* Cartoon Piggy Decoration */}
      <div className="flex justify-center mb-[-10px]">
         <div className="relative w-24 h-20">
            {/* Ears */}
            <div className="absolute top-0 left-1 w-6 h-8 bg-peppa-pink rounded-full transform -rotate-12 border-2 border-peppa-darkPink"></div>
            <div className="absolute top-0 right-5 w-6 h-8 bg-peppa-pink rounded-full transform rotate-6 border-2 border-peppa-darkPink"></div>
            {/* Head */}
            <div className="absolute top-4 left-0 w-24 h-20 bg-peppa-pink rounded-[40%_60%_60%_40%/50%_50%_50%_50%] border-2 border-peppa-darkPink"></div>
            {/* Snout */}
            <div className="absolute top-6 right-[-8px] w-12 h-10 bg-peppa-darkPink rounded-[40%] border-2 border-peppa-dress flex items-center justify-center gap-2">
               <div className="w-2 h-2 bg-peppa-dress rounded-full"></div>
               <div className="w-2 h-2 bg-peppa-dress rounded-full"></div>
            </div>
            {/* Eyes */}
            <div className="absolute top-8 left-6 w-3 h-3 bg-white rounded-full border border-black flex items-center justify-center">
               <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-7 left-12 w-3 h-3 bg-white rounded-full border border-black flex items-center justify-center">
               <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
            {/* Cheek */}
            <div className="absolute top-12 left-4 w-6 h-6 bg-peppa-darkPink opacity-50 rounded-full blur-sm"></div>
         </div>
      </div>

      {/* Header */}
      <div className="text-center bg-peppa-pink p-5 rounded-3xl shadow-lg border-4 border-white transform rotate-1 relative z-10">
        <h1 className="text-2xl font-bold text-peppa-dress drop-shadow-sm">
          日语单词配对
        </h1>
        <p className="text-white text-sm font-bold opacity-90">Vocabulary Match</p>
      </div>

      {/* Review Button */}
      {reviewCount > 0 && (
        <button
          onClick={handleReviewStart}
          className="bg-white p-3 rounded-2xl shadow-md border-b-4 border-orange-300 flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
              <RefreshCw size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-sm">错题本 / 复习</h3>
              <p className="text-xs text-gray-500">Review {reviewCount} items</p>
            </div>
          </div>
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Go
          </div>
        </button>
      )}

      {/* Level Selection */}
      <div className="bg-white p-4 rounded-2xl shadow-md border-b-4 border-peppa-pink">
        <h2 className="text-lg font-bold text-peppa-dress mb-3 flex items-center gap-2">
          <GraduationCap size={20} /> 难度等级
        </h2>
        <div className="flex justify-between gap-2">
          {Object.values(JLPTLevel).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all transform active:scale-95 relative overflow-hidden text-sm ${
                level === l
                  ? 'bg-peppa-dress text-white shadow-lg ring-2 ring-peppa-pink ring-offset-2'
                  : 'bg-peppa-pink text-peppa-mud hover:bg-peppa-darkPink'
              }`}
            >
              {l}
              {(progress[l] || 0) > 0 && (
                <div className="absolute top-1 right-1">
                  <Star size={10} className="text-yellow-300 fill-yellow-300" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conjugation Selection */}
      <div className="bg-white p-4 rounded-2xl shadow-md border-b-4 border-peppa-pink flex-1">
        <h2 className="text-lg font-bold text-peppa-dress mb-2 flex items-center gap-2">
          <Zap size={20} /> 动词变形练习
        </h2>
        <p className="text-xs text-gray-500 mb-3">选择特定变形 (可多选 / 不选则默认等级单词)</p>
        
        <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {Object.values(ConjugationType).map((type) => {
             const isSelected = selectedConjugations.includes(type);
             return (
              <button
                key={type}
                onClick={() => toggleConjugation(type)}
                className={`p-2 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-peppa-sky text-blue-900 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="truncate mr-1">{CONJUGATION_LABELS[type]}</span>
                {isSelected && <Check size={14} className="text-blue-600 flex-shrink-0" />}
              </button>
             );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full bg-peppa-grass text-white text-xl font-bold py-3 rounded-full shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
      >
        <BookOpen size={24} />
        开始游戏
      </button>
    </div>
  );
};

export default MenuScreen;
