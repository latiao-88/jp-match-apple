
import React, { useEffect, useState, useRef } from 'react';
import { WordPair, CardItem } from '../types';
import RubyText from './RubyText';
import { Volume2, Home } from 'lucide-react';

interface GameScreenProps {
  data: WordPair[];
  onFinish: (mistakes: WordPair[]) => void;
  onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ data, onFinish, onBack }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mistakePairIds, setMistakePairIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Game
  useEffect(() => {
    const leftCards: CardItem[] = [];
    const rightCards: CardItem[] = [];
    
    data.forEach((pair, index) => {
      // Create JP Card
      const jpCard: CardItem = {
        id: `card-jp-${index}`,
        pairId: pair.id,
        type: 'JP',
        content: <RubyText segments={pair.jp.segments} />, // Updated to pass segments
        textForSpeech: pair.jp.text, 
        isMatched: false,
        isSelected: false,
        isError: false
      };

      // Create CN Card
      const cnCard: CardItem = {
        id: `card-cn-${index}`,
        pairId: pair.id,
        type: 'CN',
        content: <span className="text-lg md:text-xl font-bold text-gray-800 whitespace-nowrap">{pair.cn}</span>,
        isMatched: false,
        isSelected: false,
        isError: false
      };

      leftCards.push(jpCard);
      rightCards.push(cnCard);
    });

    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);
    
    setCards([...shuffle(leftCards), ...shuffle(rightCards)]);
  }, [data]);

  // Check for win condition
  useEffect(() => {
    if (data.length > 0 && matchedPairIds.length === data.length) {
      const mistakeList = data.filter(pair => mistakePairIds.has(pair.id));
      setTimeout(() => onFinish(mistakeList), 1000);
    }
  }, [matchedPairIds, data.length, onFinish, mistakePairIds, data]);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = (clickedCard: CardItem) => {
    if (isProcessing || clickedCard.isMatched || clickedCard.id === selectedCardId) return;

    if (clickedCard.type === 'JP' && clickedCard.textForSpeech) {
      playAudio(clickedCard.textForSpeech);
    }

    if (!selectedCardId) {
      setSelectedCardId(clickedCard.id);
      setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, isSelected: true } : c));
      return;
    }

    const firstCard = cards.find(c => c.id === selectedCardId);
    if (!firstCard) return;

    const isMatch = firstCard.pairId === clickedCard.pairId;

    if (isMatch) {
      setCards(prev => prev.map(c => {
        if (c.id === firstCard.id || c.id === clickedCard.id) {
          return { ...c, isSelected: false, isMatched: true };
        }
        return c;
      }));
      setMatchedPairIds(prev => [...prev, firstCard.pairId]);
      setSelectedCardId(null);
    } else {
      setIsProcessing(true);
      setMistakePairIds(prev => new Set(prev).add(firstCard.pairId));

      setCards(prev => prev.map(c => {
        if (c.id === firstCard.id || c.id === clickedCard.id) {
          return { ...c, isSelected: false, isError: true };
        }
        return c;
      }));

      setTimeout(() => {
        setCards(prev => prev.map(c => {
          if (c.id === firstCard.id || c.id === clickedCard.id) {
            return { ...c, isError: false, isSelected: false };
          }
          return c;
        }));
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 800);
    }
  };

  const jpCards = cards.filter(c => c.type === 'JP');
  const cnCards = cards.filter(c => c.type === 'CN');
  
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow text-peppa-mud hover:bg-gray-100 flex items-center justify-center">
          <Home size={24} />
        </button>
        <div className="bg-white px-4 py-2 rounded-full shadow text-peppa-dress font-bold">
          {matchedPairIds.length} / {data.length}
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex gap-2 md:gap-4 overflow-hidden">
        {/* Left Column (JP) - Wider */}
        <div className="flex-[1.4] flex flex-col gap-2 md:gap-3">
          {jpCards.map(card => (
             <CardComponent key={card.id} card={card} onClick={() => handleCardClick(card)} />
          ))}
        </div>
        
        {/* Right Column (CN) */}
        <div className="flex-1 flex flex-col gap-2 md:gap-3">
          {cnCards.map(card => (
             <CardComponent key={card.id} card={card} onClick={() => handleCardClick(card)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CardComponent: React.FC<{ card: CardItem, onClick: () => void }> = ({ card, onClick }) => {
  let baseClasses = "relative flex-1 rounded-xl shadow-sm border-2 flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer transition-all active:scale-95 select-none touch-manipulation min-h-[70px] md:min-h-[85px]";
  let colorClasses = "";
  
  if (card.isMatched) {
    colorClasses = "bg-green-100 border-peppa-grass opacity-50"; 
  } else if (card.isError) {
    colorClasses = "bg-red-100 border-red-500 animate-pulse"; 
  } else if (card.isSelected) {
    colorClasses = "bg-peppa-sky border-blue-500 ring-2 ring-blue-300"; 
  } else {
    colorClasses = "bg-white border-peppa-pink hover:border-peppa-darkPink shadow-peppa-pink"; 
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`} onClick={onClick}>
      <div className="w-full h-full flex items-center justify-center text-center">
        {card.content}
      </div>
      {card.type === 'JP' && !card.isMatched && (
        <Volume2 size={14} className="absolute bottom-1 right-1 text-peppa-dress opacity-40" />
      )}
      {card.isMatched && (
        <div className="absolute inset-0 flex items-center justify-center text-peppa-grass opacity-100 font-bold text-2xl">
          ✓
        </div>
      )}
    </div>
  );
};

export default GameScreen;
