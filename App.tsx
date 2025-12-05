import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { GameState, GameConfig, WordPair } from './types';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import { generateWordPairs } from './services/geminiService';
import { saveProgress, addToReviewList, removeReviewItemsByText } from './services/storageService';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

// --- Error Boundary Component ---
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-red-500">Something went wrong.</h1>
          <p className="text-gray-600 mt-2">{this.state.error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-gray-200 px-4 py-2 rounded">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentData, setCurrentData] = useState<WordPair[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<GameConfig | null>(null);

  const startGame = async (config: GameConfig) => {
    setCurrentConfig(config);
    setGameState(GameState.LOADING);
    setLoadingError(null);
    try {
      let data: WordPair[];

      if (config.isReviewMode && config.reviewData) {
        data = config.reviewData;
      } else {
        data = await generateWordPairs(config);
      }
      
      if (data && data.length > 0) {
        setCurrentData(data);
        setGameState(GameState.PLAYING);
      } else {
        throw new Error("Failed to load data");
      }
    } catch (e) {
      setLoadingError("Could not load words. Please check your connection.");
      setGameState(GameState.ERROR);
    }
  };

  const handleFinish = (mistakes: WordPair[]) => {
    // Save progress
    if (currentConfig?.isReviewMode) {
      const allTextInGame = currentData.map(d => d.jp.text);
      const mistakenText = new Set(mistakes.map(d => d.jp.text));
      
      const solvedText = allTextInGame.filter(text => !mistakenText.has(text));
      removeReviewItemsByText(solvedText);
    } else {
      if (currentConfig?.level) {
        saveProgress(currentConfig.level);
      }
      if (mistakes.length > 0) {
        addToReviewList(mistakes);
      }
    }

    setGameState(GameState.RESULT);
  };

  const resetGame = () => {
    setGameState(GameState.MENU);
    setCurrentData([]);
    setCurrentConfig(null);
  };

  return (
    <div className="min-h-screen bg-peppa-sky relative overflow-hidden">
      {/* Background decorations - Hills */}
      <div className="fixed bottom-0 left-0 right-0 h-1/4 bg-peppa-grass rounded-t-[50%] scale-125 translate-y-10 z-0 pointer-events-none"></div>
      
      {/* Main Content Area */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        
        {gameState === GameState.MENU && (
          <MenuScreen onStart={startGame} />
        )}

        {gameState === GameState.LOADING && (
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
             {/* Jumping Pig Animation */}
             <div className="mb-6 animate-bounce">
                <div className="relative w-16 h-14 bg-peppa-pink rounded-[40%_60%_60%_40%/50%_50%_50%_50%] border-2 border-peppa-darkPink">
                   <div className="absolute top-0 right-[-6px] w-8 h-6 bg-peppa-darkPink rounded-[40%] border-2 border-peppa-dress flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 bg-peppa-dress rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-peppa-dress rounded-full"></div>
                   </div>
                   <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full border border-black">
                      <div className="w-0.5 h-0.5 bg-black rounded-full mx-auto mt-0.5"></div>
                   </div>
                </div>
             </div>
             
             <p className="text-xl font-bold text-peppa-mud animate-pulse">
               {currentConfig?.isReviewMode ? "准备复习中..." : "单词生成中..."}
             </p>
             <p className="text-sm text-gray-500 mt-2">Peppa is thinking... 🐷</p>
          </div>
        )}

        {gameState === GameState.ERROR && (
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-xs">
             <div className="text-4xl mb-4">🐷💦</div>
             <p className="text-lg font-bold text-peppa-dress mb-4">Oh dear!</p>
             <p className="text-gray-600 mb-6">{loadingError || "Something went wrong."}</p>
             <button onClick={resetGame} className="bg-peppa-dress text-white px-6 py-2 rounded-full font-bold">
               Try Again
             </button>
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <GameScreen 
            data={currentData} 
            onFinish={handleFinish} 
            onBack={() => setGameState(GameState.MENU)}
          />
        )}

        {gameState === GameState.RESULT && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center border-4 border-peppa-pink animation-bounce-in mx-4 w-full max-w-sm">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-peppa-dress mb-2">Excellent!</h2>
            <p className="text-peppa-mud mb-6 font-bold">完成所有配对!</p>
            
            {currentConfig?.isReviewMode && (
              <p className="text-sm text-green-600 mb-4 bg-green-50 p-2 rounded-lg">
                答对的单词已从错题本移除!
              </p>
            )}

            <button 
              onClick={resetGame}
              className="w-full bg-peppa-grass text-white py-3 px-8 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              <RefreshCw size={20} />
              {currentConfig?.isReviewMode ? "返回菜单" : "再玩一次"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;