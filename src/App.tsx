import React, { useState, useMemo, useEffect } from 'react';
import { Mountain as Rock, FileText as Paper, Scissors, RotateCcw, Activity, History, Info, ChevronRight, Zap, Maximize, Minimize, X, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { PredictionEngine, Choice, CHOICES, BEATEN_BY } from './predictionEngine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [engine] = useState(() => new PredictionEngine());
  const [history, setHistory] = useState(engine.getHistory());
  const [intendedMove, setIntendedMove] = useState<Choice | null>(null);
  const [lastLog, setLastLog] = useState<{player: Choice, npc: Choice} | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const prediction = useMemo(() => {
    if (!intendedMove) return null;
    return engine.predictNpcResponse(intendedMove);
  }, [intendedMove, history]);

  const recordOutcome = (actualNpcMove: Choice) => {
    if (!intendedMove) return;
    engine.recordActualOutcome(intendedMove, actualNpcMove);
    setHistory([...engine.getHistory()]);
    setLastLog({ player: intendedMove, npc: actualNpcMove });
    setIntendedMove(null); 
  };

  const reset = () => {
    engine.clearHistory();
    setHistory([]);
    setLastLog(null);
    setIntendedMove(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'DOS RPS Predictor',
      text: 'Hey! this one predicts Rock x Paper x Scissors AI moves in Divinity: Original Sin!',
      url: 'https://kannan-ji.github.io/Divinity-RPS/',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        // Minimal visual feedback could be added here if needed
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <main className="h-screen w-full bg-[#0F1012] flex items-center justify-center p-0 md:p-4 overflow-hidden">
      {/* Portrait container - 9:16 ratio */}
      <article className="w-full h-full md:h-auto md:max-w-[600px] md:aspect-[9/16] md:max-h-[90vh] bg-[#151619] shadow-2xl relative flex flex-col border-[#2A2B2E] md:border-4 md:rounded-[3rem] overflow-hidden">
        
        {/* CRT Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%]" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>

        {/* Main Interface Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-6 pt-10 pb-2">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-4 shrink-0">
            <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#8E9299] font-bold">DOS RPS Predictor</h1>
            <button 
              onClick={handleShare}
              className="text-[#8E9299] hover:text-white transition-colors p-2 -mr-2"
              title="Share app"
            >
              <Share2 size={16} />
            </button>
          </header>

          {/* Active Battle Widget - Fixed height at top */}
          <section className="relative mb-6 shrink-0" aria-label="Current Prediction">
            <div className="bg-[#1D1E22] rounded-3xl p-6 border border-[#2A2B2E] relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#8E9299]">User Planned</div>
                  <div className="text-xl font-mono font-bold tracking-tighter text-blue-400">
                    {intendedMove ? intendedMove.toUpperCase() : "AWAITING..."}
                  </div>
                </div>
                <div className="h-8 w-px bg-[#2A2B2E]" />
                <div className="space-y-1 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-[#8E9299]">AI Projection</div>
                  <div className="text-xl font-mono font-bold tracking-tighter text-white">
                    {prediction ? prediction.prediction.toUpperCase() : "---"}
                  </div>
                </div>
              </div>

              {/* Visual Comparison Area */}
              <div className="flex items-center justify-center gap-4 py-4">
                <motion.div 
                  key={`user-${intendedMove}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all",
                    intendedMove ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_#3b82f644]" : "border-[#2A2B2E] bg-[#151619]"
                  )}
                >
                  {intendedMove ? <ChoiceIcon choice={intendedMove} size={40} className="text-blue-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#2A2B2E]" />}
                </motion.div>

                <div className="text-[#2A2B2E] font-mono text-sm">VS</div>

                <motion.div 
                  key={`ai-${prediction?.prediction}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all",
                    prediction ? "border-white bg-white/5 shadow-[0_0_20px_#ffffff22]" : "border-[#2A2B2E] bg-[#151619]"
                  )}
                >
                  {prediction ? <ChoiceIcon choice={prediction.prediction} size={40} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#2A2B2E]" />}
                </motion.div>
              </div>

              {/* Info / Confidence */}
              {prediction && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <Zap size={14} />
                    <span className="font-mono text-[10px] uppercase tracking-wider">{Math.round(prediction.confidence * 100)}% Confidence</span>
                  </div>
                  <div className="font-mono text-[9px] text-[#8E9299] uppercase tracking-widest bg-[#151619] px-2 py-1 rounded">
                    {prediction.strategy}
                  </div>
                </motion.div>
              )}
            </div>
          </section>
          
          {/* Previous Moves Section - Takes up remaining height */}
          <section className="flex-1 flex flex-col min-h-0 min-w-0" aria-label="Move History">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <History size={14} className="text-[#8E9299]" />
                <h2 className="text-[10px] uppercase font-mono tracking-[2px] text-[#8E9299]">Previous Moves Tracking</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[9px] font-mono text-[#5E6269] uppercase tracking-widest">
                  {history.length} Cycles
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={reset}
                    className="text-[#5E6269] hover:text-red-400 transition-colors p-1"
                    title="Clear history"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-32">
              {history.length > 0 ? (
                history.slice().reverse().map((round, i) => (
                  <div 
                    key={history.length - i} 
                    className={cn(
                      "rounded-2xl p-4 border flex items-center justify-between transition-all duration-300",
                      i === 0 
                        ? "bg-[#1D1E22]/80 border-[#2A2B2E] shadow-lg scale-100" 
                        : "bg-[#1D1E22]/30 border-[#2A2B2E]/50 opacity-80"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("text-xs font-mono font-bold", i === 0 ? "text-[#8E9299]" : "text-[#5E6269]")}>
                        #{history.length - i}
                      </div>
                      <div className="flex items-center gap-3">
                        <ChoiceIcon choice={round.playerMove} size={i === 0 ? 18 : 14} className={cn(i === 0 ? "text-blue-400" : "opacity-70 text-blue-400/70")} />
                        <span className="text-xs font-mono text-white/30 font-bold">VS</span>
                        <ChoiceIcon choice={round.npcMove} size={i === 0 ? 18 : 14} className={cn(i === 0 ? "text-white" : "opacity-70 text-white/70")} />
                      </div>
                    </div>
                    <div className={cn(
                      "font-mono uppercase tracking-[2px] px-3 py-1 rounded-full font-bold",
                      i === 0 ? "text-xs" : "text-[10px]",
                      round.result === 'win' 
                        ? (i === 0 ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-green-500/60") 
                        : (i === 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-red-500/60")
                    )}>
                      {round.result}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#2A2B2E] rounded-3xl min-h-[100px]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299]">Awaiting Combat Data</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Floating Bottom Bar - Fixed with glass effect */}
        <section className="absolute bottom-0 left-0 right-0 px-6 py-6 z-30 shrink-0" aria-label="Input Controls">
          <div className="bg-[#1D1E22]/90 backdrop-blur-md border border-[#2A2B2E] rounded-[2rem] p-3 shadow-2xl flex flex-col gap-2">
            {!intendedMove ? (
              <>
                <div className="text-center pt-0 pb-0">
                  <h2 className="text-[9px] uppercase font-mono tracking-[4px] text-[#8E9299]/80 font-bold">Your Move</h2>
                </div>
                <div className="flex gap-2 h-14">
                  {CHOICES.map(choice => (
                    <button 
                      key={choice}
                      onClick={() => setIntendedMove(choice)}
                      className="flex-1 h-full rounded-2xl border border-[#2A2B2E] bg-[#151619] flex flex-col items-center justify-center gap-1 text-[#8E9299] hover:border-[#22c55e] hover:text-[#22c55e] transition-all group"
                      aria-label={`Select ${choice}`}
                    >
                      <ChoiceIcon choice={choice} size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] uppercase font-mono tracking-tighter opacity-60 group-hover:opacity-100">{choice}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-center pt-0 pb-0">
                  <h2 className="text-[9px] uppercase font-mono tracking-[4px] text-[#8E9299]/80 font-bold">Actual NPC Move</h2>
                </div>
                <div className="flex items-center gap-2 h-14">
                  <div className="flex-1 flex gap-2 h-full">
                    {CHOICES.filter(c => c !== intendedMove).map(choice => (
                      <button 
                        key={`n-${choice}`}
                        onClick={() => recordOutcome(choice)}
                        className="flex-1 h-full rounded-2xl border border-[#2A2B2E] bg-[#151619] flex flex-col items-center justify-center gap-1 text-[#8E9299] hover:border-[#22c55e] hover:text-[#22c55e] transition-all group"
                        aria-label={`Confirm NPC played ${choice}`}
                      >
                        <ChoiceIcon choice={choice} size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] uppercase font-mono tracking-tighter opacity-60 group-hover:opacity-100">{choice}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setIntendedMove(null)}
                    className="w-14 h-full rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

      </article>
    </main>
  );
}

function ChoiceIcon({ choice, size = 24, className }: { choice: Choice, size?: number, className?: string }) {
  switch (choice) {
    case 'rock': return <Rock size={size} className={className} />;
    case 'paper': return <Paper size={size} className={className} />;
    case 'scissors': return <Scissors size={size} className={className} />;
  }
}
