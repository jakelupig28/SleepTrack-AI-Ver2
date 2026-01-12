import React, { useState } from 'react';
import { SleepSession } from '../types';
import { CloudMoon, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { interpretDream } from '../services/geminiService';

interface DreamScapeProps {
  onAddSession: (session: SleepSession) => void;
}

const DreamScape: React.FC<DreamScapeProps> = ({ onAddSession }) => {
  const [dreamText, setDreamText] = useState('');
  const [duration, setDuration] = useState(7.5); // Default to decent sleep
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ interpretation: string; themes: string[] } | null>(null);

  const handleInterpret = async () => {
    if (!dreamText.trim()) return;
    setIsProcessing(true);
    
    // Call Gemini
    const analysis = await interpretDream(dreamText);
    setResult(analysis);
    setIsProcessing(false);
  };

  const handleSaveToLog = () => {
    if (!result) return;

    // Create a sleep session based on this dream
    // We infer sleep stages loosely for the chart
    const totalMinutes = duration * 60;
    const newSession: SleepSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.round(totalMinutes),
      quality: 80, // Default good quality if dreaming vividly
      stages: { 
        deep: Math.round(totalMinutes * 0.15), 
        rem: Math.round(totalMinutes * 0.35), // Higher REM for dreams
        light: Math.round(totalMinutes * 0.45), 
        awake: Math.round(totalMinutes * 0.05) 
      },
      noiseEvents: 0,
      dreamNotes: dreamText,
      dreamAnalysis: result,
      aiAnalysis: "Logged via Dream Scape",
    };

    onAddSession(newSession);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white dark:bg-midnight/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

           <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Dream Interpretation</h2>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6 text-slate-700 dark:text-slate-300 leading-relaxed italic border border-slate-100 dark:border-slate-700">
                "{dreamText}"
              </div>

              <div className="space-y-6">
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Psychological Meaning</h3>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {result.interpretation}
                    </p>
                 </div>

                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Key Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.themes.map((theme, i) => (
                        <span key={i} className="px-3 py-1 bg-nebula/10 text-nebula border border-nebula/20 rounded-full text-sm font-medium">
                          #{theme}
                        </span>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={handleSaveToLog}
                  className="px-6 py-3 bg-nebula hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Save to Sleep Log</span>
                </button>
              </div>
           </div>
        </div>
        
        <button 
          onClick={() => { setResult(null); setDreamText(''); }} 
          className="mt-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm w-full text-center"
        >
          Analyze another dream
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-midnight/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-2xl font-bold dark:text-white mb-2 flex items-center space-x-2">
           <CloudMoon className="w-8 h-8 text-nebula" />
           <span>Dream Scape</span>
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Write down your dream. Our AI will interpret the hidden meanings and symbols.
        </p>
        
        <div className="space-y-6">
          <textarea 
            rows={6}
            value={dreamText}
            onChange={e => setDreamText(e.target.value)}
            placeholder="I was flying over a city made of glass..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-nebula outline-none resize-none text-lg"
          />

          {/* Quick Duration Slider - Hidden functionality to act as tracker */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                   <Clock className="w-4 h-4" />
                   <span className="text-sm font-medium">Time Slept</span>
                </div>
                <span className="text-sm font-bold text-nebula">{Math.floor(duration)}h {Math.round((duration % 1) * 60)}m</span>
             </div>
             <input 
              type="range" 
              min="3" 
              max="12" 
              step="0.5"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-nebula"
            />
          </div>

          <button 
            onClick={handleInterpret}
            disabled={!dreamText.trim() || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-nebula to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center space-x-2 hover:scale-[1.01]"
          >
            {isProcessing ? (
               <>
                 <Sparkles className="w-5 h-5 animate-spin" />
                 <span>Interpreting Dream...</span>
               </>
            ) : (
               <>
                 <Sparkles className="w-5 h-5" />
                 <span>Reveal Meaning</span>
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamScape;
