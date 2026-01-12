import React, { useState, useEffect } from 'react';
import { Moon, Clock, Wind, ArrowRight, Play, Pause, RotateCcw, BedDouble, AlertTriangle } from 'lucide-react';

const SleepLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'breathe' | 'debt'>('calculator');

  // Calculator State
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepResults, setSleepResults] = useState<string[]>([]);

  // Breathing State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathText, setBreathText] = useState('Ready');
  const [breathScale, setBreathScale] = useState(1);

  // Debt State
  const [neededSleep, setNeededSleep] = useState(8);
  const [actualSleep, setActualSleep] = useState(6);
  const [debtResult, setDebtResult] = useState<string>('');
  
  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      let phase = 0; // 0: Inhale (4s), 1: Hold (7s), 2: Exhale (8s)
      let count = 0;

      const runCycle = () => {
        if (phase === 0) {
          setBreathText('Inhale...');
          setBreathScale(1.5);
          setTimeout(() => { phase = 1; runCycle(); }, 4000);
        } else if (phase === 1) {
          setBreathText('Hold...');
          setBreathScale(1.5); // Stay expanded
          setTimeout(() => { phase = 2; runCycle(); }, 7000);
        } else if (phase === 2) {
          setBreathText('Exhale...');
          setBreathScale(1);
          setTimeout(() => { phase = 0; runCycle(); }, 8000);
        }
      };
      runCycle();
    } else {
      setBreathText('Ready');
      setBreathScale(1);
    }
    return () => clearTimeout(interval);
  }, [isBreathing]);

  const calculateSleepCycles = () => {
    const [hours, mins] = wakeTime.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, mins, 0);
    // If time is earlier than now, assume tomorrow
    if (wakeDate.getTime() < Date.now()) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const cycles = [];
    // Calculate backwards: 6 cycles (9h), 5 cycles (7.5h), 4 cycles (6h), 3 cycles (4.5h)
    // Average 15 mins to fall asleep
    for (let i = 6; i >= 3; i--) {
      const sleepTime = new Date(wakeDate.getTime() - (i * 90 * 60000) - (15 * 60000));
      cycles.push(sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setSleepResults(cycles);
  };

  const calculateDebt = () => {
    const debt = neededSleep - actualSleep;
    if (debt <= 0) {
      setDebtResult("You are sleep positive! Keep maintaining this schedule.");
    } else {
      const makeupDays = Math.ceil(debt * 60 / 20); // Make up 20 mins extra per day
      setDebtResult(`You have a sleep debt of ${debt} hours. Try going to bed 20 minutes earlier for the next ${makeupDays} days to recover.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white flex items-center justify-center gap-3">
          <Moon className="w-8 h-8 text-nebula" />
          <span>Sleep Lab</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Tools to optimize your sleep cycles and mental state.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-midnight border border-slate-200 dark:border-slate-800 p-1 rounded-2xl flex space-x-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'calculator' 
                ? 'bg-nebula text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Smart Wake Calculator
          </button>
          <button
            onClick={() => setActiveTab('debt')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'debt' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Debt Calculator
          </button>
          <button
            onClick={() => setActiveTab('breathe')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'breathe' 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            4-7-8 Breathing
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-midnight/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[400px]">
        {activeTab === 'calculator' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">Cycle Calculator</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
              Waking up in the middle of a sleep cycle causes grogginess. Calculate the perfect time to fall asleep.
            </p>

            <div className="flex flex-col items-center space-y-6 w-full max-w-xs">
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  I want to wake up at:
                </label>
                <input 
                  type="time" 
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full text-center text-3xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 focus:ring-2 focus:ring-nebula outline-none dark:text-white"
                />
              </div>

              <button 
                onClick={calculateSleepCycles}
                className="w-full py-4 bg-nebula hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                Calculate Bedtime
              </button>
            </div>

            {sleepResults.length > 0 && (
              <div className="mt-10 w-full animate-fade-in">
                <p className="text-center text-slate-500 dark:text-slate-400 mb-4 text-sm">You should try to fall asleep at one of these times:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sleepResults.map((time, i) => (
                    <div key={i} className={`p-4 rounded-xl text-center border ${
                      i === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 transform scale-105 shadow-md' :
                      i === 1 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                      'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 opacity-80'
                    }`}>
                      <div className="text-lg font-bold">{time}</div>
                      <div className="text-xs mt-1">
                        {i === 0 ? '9 hours (Best)' : 
                         i === 1 ? '7.5 hours (Good)' : 
                         i === 2 ? '6 hours (Okay)' : '4.5 hours'}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-400 mt-6">*Includes average 15 min to fall asleep</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'debt' && (
           <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">Sleep Debt Calculator</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
              Determine if you're carrying a sleep deficit and get a plan to recover.
            </p>

            <div className="w-full max-w-md space-y-6">
               <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Ideal Sleep (Hours)
                  </label>
                  <input 
                    type="number" 
                    value={neededSleep}
                    onChange={(e) => setNeededSleep(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Actual Sleep Last Night (Hours)
                  </label>
                  <input 
                    type="number" 
                    value={actualSleep}
                    onChange={(e) => setActualSleep(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white"
                  />
               </div>
               
               <button 
                onClick={calculateDebt}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all"
              >
                Calculate Debt
              </button>

              {debtResult && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 p-4 rounded-xl text-center text-orange-800 dark:text-orange-200 animate-fade-in">
                  {debtResult}
                </div>
              )}
            </div>
           </div>
        )}

        {activeTab === 'breathe' && (
          <div className="flex flex-col items-center animate-fade-in">
             <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <Wind className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">4-7-8 Breathing</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
              A powerful technique to calm the nervous system and induce sleepiness quickly.
            </p>

            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              {/* Breathing Circle Animation */}
              <div 
                className="absolute inset-0 bg-emerald-500/20 rounded-full transition-transform duration-[4000ms] ease-in-out"
                style={{ transform: `scale(${breathScale})`, transitionDuration: breathText === 'Inhale...' ? '4000ms' : breathText === 'Exhale...' ? '8000ms' : '0ms' }}
              ></div>
              <div 
                className="absolute inset-4 bg-emerald-500/30 rounded-full transition-transform duration-[4000ms] ease-in-out"
                style={{ transform: `scale(${breathScale * 0.9})`, transitionDuration: breathText === 'Inhale...' ? '4000ms' : breathText === 'Exhale...' ? '8000ms' : '0ms' }}
              ></div>
              <div className="relative z-10 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {breathText}
              </div>
            </div>

            <div className="flex space-x-4">
               {!isBreathing ? (
                 <button 
                  onClick={() => setIsBreathing(true)}
                  className="flex items-center space-x-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Exercise</span>
                </button>
               ) : (
                 <button 
                  onClick={() => setIsBreathing(false)}
                  className="flex items-center space-x-2 px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Stop</span>
                </button>
               )}
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-8 text-center text-sm w-full max-w-md">
               <div>
                 <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-lg">4s</span>
                 <span className="text-slate-500">Inhale through nose</span>
               </div>
               <div>
                 <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-lg">7s</span>
                 <span className="text-slate-500">Hold breath</span>
               </div>
               <div>
                 <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-lg">8s</span>
                 <span className="text-slate-500">Exhale through mouth</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepLab;
