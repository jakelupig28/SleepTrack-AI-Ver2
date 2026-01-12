import React, { useState } from 'react';
import { SleepSession, UserProfile } from '../types';
import { CloudMoon, Activity, Smartphone, BookOpen, Coffee, Save } from 'lucide-react';
import { analyzeSleepSession } from '../services/geminiService';

interface SleepTrackerProps {
  onAddSession: (session: SleepSession) => void;
  userProfile?: UserProfile;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ onAddSession, userProfile }) => {
  // Manual Entry Form State
  const [duration, setDuration] = useState(7.5);
  const [quality, setQuality] = useState(75);
  const [dreamNotes, setDreamNotes] = useState('');
  
  // Daily Context
  const [caffeineIntake, setCaffeineIntake] = useState('');
  const [preSleepActivity, setPreSleepActivity] = useState<string[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleActivity = (activity: string) => {
    setPreSleepActivity(prev => 
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate stages based on duration and quality
    const totalMinutes = duration * 60;
    const deep = Math.round(totalMinutes * 0.20 * (quality/100));
    const rem = Math.round(totalMinutes * 0.25 * (quality/100));
    const light = Math.round(totalMinutes * 0.50);
    const awake = Math.max(0, totalMinutes - deep - rem - light);

    // Fix: Use local date for the session log to match user's actual day
    // This creates a date string like "2023-10-27" in user's timezone
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
                      .toISOString().split('T')[0];

    const newSession: SleepSession = {
      id: Date.now().toString(),
      date: localDate,
      durationMinutes: Math.round(totalMinutes),
      quality,
      stages: { deep, rem, light, awake },
      noiseEvents: 0, // Removed tracking
      dreamNotes,
      caffeineIntake: caffeineIntake || "Not specified",
      preSleepActivity
    };

    // Get AI Analysis
    const analysis = await analyzeSleepSession(newSession, userProfile);
    newSession.aiAnalysis = analysis;

    onAddSession(newSession);
    setIsAnalyzing(false);
    
    // Reset form
    setDreamNotes('');
    setCaffeineIntake('');
    setPreSleepActivity([]);
    setDuration(7.5);
    setQuality(75);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-midnight/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-2xl font-bold dark:text-white mb-2 flex items-center space-x-2">
           <CloudMoon className="w-8 h-8 text-nebula" />
           <span>Log Last Night's Sleep</span>
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          How did you sleep? Record your session to get AI insights.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Duration Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <label className="text-lg font-medium text-slate-700 dark:text-slate-200">
                 Duration
               </label>
               <span className="text-2xl font-bold text-nebula">
                 {Math.floor(duration)}h {Math.round((duration % 1) * 60)}m
               </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="14" 
              step="0.5"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-nebula"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
               <span>0h</span>
               <span>4h</span>
               <span>8h</span>
               <span>12h+</span>
            </div>
          </div>

          {/* Quality Slider */}
          <div>
             <div className="flex justify-between items-center mb-4">
               <label className="text-lg font-medium text-slate-700 dark:text-slate-200">
                 Quality Score
               </label>
               <span className={`text-2xl font-bold ${quality > 80 ? 'text-emerald-500' : quality > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                 {quality}%
               </span>
            </div>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={quality}
               onChange={e => setQuality(Number(e.target.value))}
               className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-nebula"
             />
             <div className="flex justify-between text-xs text-slate-400 mt-2">
               <span>Poor</span>
               <span>Fair</span>
               <span>Good</span>
               <span>Excellent</span>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-6"></div>

          {/* Daily Context */}
          <div className="space-y-6">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-nebula" />
              <span>Daily Factors</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">Caffeine Yesterday</label>
                <div className="flex flex-wrap gap-2">
                  {['None', '1-2 cups', '3+ cups'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCaffeineIntake(opt)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        caffeineIntake === opt 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">Before Bed</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Screen Time', icon: <Smartphone className="w-4 h-4"/> },
                    { id: 'Reading', icon: <BookOpen className="w-4 h-4"/> },
                    { id: 'Late Meal', icon: <Coffee className="w-4 h-4"/> },
                    { id: 'Workout', icon: <Activity className="w-4 h-4"/> },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleActivity(item.id)}
                      className={`px-4 py-2 rounded-xl text-sm border flex items-center space-x-2 transition-all ${
                        preSleepActivity.includes(item.id)
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Dream Notes (Optional)</label>
            <textarea 
              rows={3}
              value={dreamNotes}
              onChange={e => setDreamNotes(e.target.value)}
              placeholder="Describe what you dreamt about..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-nebula outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isAnalyzing}
            className="w-full py-4 bg-nebula hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
          >
            {isAnalyzing ? (
               <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Analyzing Sleep...</span>
               </>
            ) : (
               <>
                 <Save className="w-5 h-5" />
                 <span>Save Log</span>
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SleepTracker;
