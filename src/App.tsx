import React, { useState, useMemo, useEffect } from 'react';
import { Mountain as Rock, FileText as Paper, Scissors, RotateCcw, Activity, History, Info, ChevronRight, Zap, Maximize, Minimize } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const prediction = useMemo(() => {
    if (!intendedMove) return null;
    return engine.predictNpcResponse(intendedMove);
  }, [intendedMove, history]);

  const counterMove = useMemo(() => {
    if (!prediction) return null;
    return BEATEN_BY[prediction.prediction];
  }, [prediction]);

  const recordOutcome = (actualNpcMove: Choice) => {
    if (!intendedMove) return;
    engine.recordActualOutcome(intendedMove, actualNpcMove);
    setHistory([...engine.getHistory()]);
    setLastLog({ player: intendedMove, npc: actualNpcMove });
    setIntendedMove(null); // Reset for next interaction
  };

  const reset = () => {
    engine.clearHistory();
    setHistory([]);
    setLastLog(null);
    setIntendedMove(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#E6E6E6] transition-all duration-500">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Side: Prediction Monitor */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#151619] text-white rounded-2xl p-8 shadow-2xl border-4 border-[#2A2B2E] relative overflow-hidden">
            {/* Hardened Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            <div className="flex items-center justify-between mb-8 border-b border-[#2A2B2E] pb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full animate-pulse", history.length > 0 ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-yellow-500 shadow-[0_0_10px_#eab308]")} />
                <span className="font-mono text-[10px] uppercase tracking-[2px] text-[#8E9299]">AI Engine Matrix Status</span>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleFullscreen}
                  className="text-[#8E9299] hover:text-[#22c55e] transition-colors flex items-center gap-2 group"
                  title="Toggle Fullscreen"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest">{isFullscreen ? 'Exit Full' : 'Enter Full'}</span>
                  {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                </button>
                <button 
                  onClick={reset}
                  className="text-[#8E9299] hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest">Reset</span>
                  <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Prediction Display */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-mono text-[10px] uppercase tracking-[3px] text-[#8E9299] mb-4">Tactical Projection</h2>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between bg-[#1D1E22] p-6 rounded-2xl border border-[#2A2B2E] relative">
                      {/* Comparison View */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8E9299]">Planned</span>
                        <div className="w-20 h-20 rounded-full border border-[#2A2B2E] flex items-center justify-center bg-[#151619]">
                          {intendedMove ? (
                            <ChoiceIcon choice={intendedMove} className="text-blue-400 scale-125" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-[#2A2B2E]" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] uppercase text-white h-4">{intendedMove || ''}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-[#2A2B2E] font-mono text-[10px] items-center flex flex-col">
                           <span className="mb-2">VS</span>
                           <div className="h-px w-8 bg-[#2A2B2E]" />
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8E9299]">Predicted</span>
                        <div className="w-20 h-20 rounded-full border border-[#2A2B2E] flex items-center justify-center bg-[#151619] relative">
                           {prediction ? (
                            <ChoiceIcon choice={prediction.prediction} className="text-white scale-125" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-[#2A2B2E]" />
                          )}
                        </div>
                        <span className="font-mono text-[10px] uppercase text-white h-4">{prediction?.prediction || ''}</span>
                      </div>
                    </div>

                    {prediction && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1D1E22] p-4 rounded-xl border border-[#2A2B2E] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 text-[#22c55e]">
                          <Zap size={14} />
                          <span className="font-mono text-xs uppercase tracking-wider">{Math.round(prediction.confidence * 100)}% Confidence</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#8E9299]">
                          {prediction.strategy}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {counterMove && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-[#2A2B2E]">
                    <h2 className="font-mono text-[10px] uppercase tracking-[3px] text-[#22c55e] mb-4">Counter Instruction</h2>
                    <div className="flex items-center gap-4 bg-[#1D1E22] p-4 rounded-xl border border-[#2A2B2E] group cursor-help transition-all">
                      <div className="w-12 h-12 rounded-lg bg-[#22c55e] flex items-center justify-center text-[#151619] shadow-[0_0_15px_#22c55e44]">
                        <ChoiceIcon choice={counterMove} />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#8E9299]">Play:</div>
                        <div className="text-xl font-mono font-bold uppercase">{counterMove}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Step Flow */}
              <div className="space-y-6">
                <div className="bg-[#1D1E22] p-6 rounded-2xl border border-[#2A2B2E] space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white">System Flow</span>
                  </div>
                  
                  <div className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", !intendedMove ? "bg-[#25262B] border-blue-500" : "bg-[#1A1B1E] border-transparent opacity-50")}>
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-bold">1</div>
                    <div className="font-mono text-[10px] uppercase text-gray-300">Intend: Input your planned move</div>
                  </div>

                  <div className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", intendedMove ? "bg-[#25262B] border-[#22c55e]" : "bg-[#1A1B1E] border-transparent opacity-50")}>
                    <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-[10px] font-bold">2</div>
                    <div className="font-mono text-[10px] uppercase text-gray-300">Observe: Record actual NPC result</div>
                  </div>
                </div>

                <div className="bg-[#1D1E22] p-6 rounded-2xl border border-[#2A2B2E]">
                   <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-[#8E9299]" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Live Telemetry</span>
                  </div>
                  {lastLog ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#151619] p-3 rounded border border-[#2A2B2E]">
                        <div className="text-[10px] text-[#8E9299] uppercase mb-1">Last Match</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white uppercase">{lastLog.player}</span>
                          <ChevronRight size={10} className="text-[#8E9299]" />
                          <span className="text-xs text-white uppercase">{lastLog.npc}</span>
                        </div>
                      </div>
                      <div className="bg-[#151619] p-3 rounded border border-[#2A2B2E]">
                        <div className="text-[10px] text-[#8E9299] uppercase mb-1">Samples</div>
                        <div className="text-xs text-white uppercase">{history.length}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#8E9299] font-mono uppercase italic">Awaiting first session...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Area */}
          <div className="bg-white rounded-2xl p-8 border border-[#D1D1D1] shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Step 1: Input Intent */}
                 <div className={cn("transition-opacity duration-300", intendedMove ? "opacity-30 pointer-events-none" : "opacity-100")}>
                    <div className="text-[10px] uppercase tracking-[3px] text-gray-500 mb-6 flex items-center gap-2 font-bold">
                       <span className="w-5 h-5 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">1</span>
                       Input Planned Move
                    </div>
                    <div className="flex gap-4">
                       {CHOICES.map(choice => (
                         <button 
                           key={`p-${choice}`}
                           onClick={() => setIntendedMove(choice)}
                           className={cn(
                             "flex-1 h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group",
                             "bg-gray-50 border-gray-100 hover:border-blue-500 hover:bg-blue-50"
                           )}
                         >
                            <ChoiceIcon choice={choice} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="text-[9px] uppercase font-mono text-gray-400 group-hover:text-blue-600">{choice}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Step 2: Record Actual */}
                 <div className={cn("transition-opacity duration-300", !intendedMove ? "opacity-30 pointer-events-none" : "opacity-100")}>
                    <div className="text-[10px] uppercase tracking-[3px] text-gray-500 mb-6 flex items-center gap-2 font-bold">
                       <span className="w-5 h-5 bg-[#22c55e] rounded text-white flex items-center justify-center text-[10px]">2</span>
                       Record Actual NPC Move
                    </div>
                     <div className="flex gap-4">
                       {CHOICES.filter(c => c !== intendedMove).map(choice => (
                         <button 
                           key={`n-${choice}`}
                           onClick={() => recordOutcome(choice)}
                           className={cn(
                             "flex-1 h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group",
                             "bg-gray-50 border-gray-100 hover:border-[#22c55e] hover:bg-green-50"
                           )}
                         >
                            <ChoiceIcon choice={choice} className="text-gray-400 group-hover:text-[#22c55e] transition-colors" />
                            <span className="text-[9px] uppercase font-mono text-gray-400 group-hover:text-[#22c55e]">{choice}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
          </div>
        </div>

        {/* Right Side: Log & Intelligence */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-2xl p-6 border border-[#D1D1D1] flex-1 flex flex-col max-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-[2px] text-gray-500 font-bold">Transaction History</h3>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-mono text-gray-500">v1.2.0</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {history.slice().reverse().map((round, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-300">#{history.length - i}</span>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-400 uppercase">P:</div>
                        <ChoiceIcon choice={round.playerMove} size={14} className="text-gray-600" />
                      </div>
                      <ChevronRight size={12} className="text-gray-300" />
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-400 uppercase">N:</div>
                        <ChoiceIcon choice={round.npcMove} size={14} className="text-gray-600" />
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded",
                      round.result === 'win' ? "bg-green-100 text-green-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {round.result}
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-300 font-mono text-xs uppercase tracking-widest px-4">
                    Empty Data Set.<br/>Record NPC moves to begin analysis.
                  </div>
                )}
              </div>
           </div>

           <div className={cn("bg-[#1D1E22] rounded-2xl p-6 text-[#8E9299]")}>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#22c55e] mb-3">Intelligence Update</h4>
              <p className="text-[10px] font-mono leading-relaxed">
                Divinity NPCs often follow 3-step cycle patterns or "Aggressive Rotation" strategies. 
                Keep recording moves to stabilize the transition matrix.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}

function ChoiceIcon({ choice, size = 24, className }: { choice: Choice, size?: number, className?: string }) {
  switch (choice) {
    case 'rock': return <Rock size={size} className={className} />;
    case 'paper': return <Paper size={size} className={className} />;
    case 'scissors': return <Scissors size={size} className={className} />;
  }
}
