import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Check, Coffee, Moon, User, Smartphone, Clock, AlertCircle, X } from 'lucide-react';

interface OnboardingQuizProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    gender: '',
    dailyCaffeine: '',
    screenTime: '',
    typicalBedtimeRoutine: [],
    averageSleepDuration: '',
    sleepIssues: []
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'typicalBedtimeRoutine' | 'sleepIssues', item: string) => {
    setProfile(prev => {
      const current = prev[key];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...current, item] };
      }
    });
  };

  const questions = [
    // Q1: Age
    {
      title: "What is your age?",
      icon: <User className="w-6 h-6 text-nebula" />,
      content: (
        <input 
          type="number" 
          value={profile.age}
          onChange={e => updateProfile('age', e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-nebula outline-none text-lg"
          placeholder="e.g. 25"
          autoFocus
        />
      ),
      isValid: !!profile.age
    },
    // Q2: Gender
    {
      title: "What is your gender?",
      icon: <User className="w-6 h-6 text-nebula" />,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
            <button
              key={g}
              onClick={() => updateProfile('gender', g)}
              className={`p-4 rounded-xl border text-left transition-all ${
                profile.gender === g 
                  ? 'bg-nebula text-white border-nebula' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      ),
      isValid: !!profile.gender
    },
    // Q3: Caffeine
    {
      title: "Daily Caffeine Intake?",
      icon: <Coffee className="w-6 h-6 text-orange-500" />,
      content: (
        <div className="space-y-3">
          {['None', '1 Cup', '2-3 Cups', '4+ Cups'].map(opt => (
            <button
              key={opt}
              onClick={() => updateProfile('dailyCaffeine', opt)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                profile.dailyCaffeine === opt 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{opt}</span>
              {profile.dailyCaffeine === opt && <Check className="w-5 h-5 text-orange-500" />}
            </button>
          ))}
        </div>
      ),
      isValid: !!profile.dailyCaffeine
    },
    // Q4: Screen Time
    {
      title: "Screen usage before bed?",
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="space-y-3">
          {['No screen time', '< 30 mins', '30-60 mins', '1-2 hours', '> 2 hours'].map(opt => (
            <button
              key={opt}
              onClick={() => updateProfile('screenTime', opt)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                profile.screenTime === opt 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{opt}</span>
              {profile.screenTime === opt && <Check className="w-5 h-5 text-blue-500" />}
            </button>
          ))}
        </div>
      ),
      isValid: !!profile.screenTime
    },
    // Q5: Pre-bed Routine
    {
      title: "What do you usually do before bed?",
      icon: <Moon className="w-6 h-6 text-purple-500" />,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['Reading', 'Meditation', 'Shower', 'Eating', 'Workout', 'TV/Movies', 'Social Media', 'Nothing specific'].map(item => (
            <button
              key={item}
              onClick={() => toggleArrayItem('typicalBedtimeRoutine', item)}
              className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                profile.typicalBedtimeRoutine.includes(item)
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500 text-purple-700 dark:text-purple-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      ),
      isValid: profile.typicalBedtimeRoutine.length > 0
    },
    // Q6: Average Sleep Duration
    {
      title: "Average sleep duration?",
      icon: <Clock className="w-6 h-6 text-emerald-500" />,
      content: (
        <div className="space-y-3">
          {['< 5 hours', '5-6 hours', '6-7 hours', '7-8 hours', '8+ hours'].map(opt => (
            <button
              key={opt}
              onClick={() => updateProfile('averageSleepDuration', opt)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                profile.averageSleepDuration === opt 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{opt}</span>
              {profile.averageSleepDuration === opt && <Check className="w-5 h-5 text-emerald-500" />}
            </button>
          ))}
        </div>
      ),
      isValid: !!profile.averageSleepDuration
    },
    // Q7: Sleep Issues
    {
      title: "Do you have any sleep issues?",
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      content: (
        <div className="space-y-2">
          {['Trouble falling asleep', 'Waking up during night', 'Waking up too early', 'Snoring', 'Nightmares', 'None'].map(item => (
            <button
              key={item}
              onClick={() => toggleArrayItem('sleepIssues', item)}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                profile.sleepIssues.includes(item)
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{item}</span>
              {profile.sleepIssues.includes(item) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      ),
      isValid: profile.sleepIssues.length > 0
    }
  ];

  const currentQ = questions[step];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-void flex items-center justify-center p-4 relative">
      {/* Cancel Button */}
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors z-50"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="w-full max-w-lg bg-white dark:bg-midnight rounded-3xl shadow-xl p-8 transition-all duration-300">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-nebula' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        
        <div className="space-y-6 animate-fade-in" key={step}>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-slate-100 dark:bg-slate-800`}>
              {currentQ.icon}
            </div>
            <h2 className="text-2xl font-bold dark:text-white">{currentQ.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Question {step + 1} of {questions.length}</p>
          </div>

          <div className="py-2">
            {currentQ.content}
          </div>

          <button 
            onClick={() => {
              if (step < questions.length - 1) {
                handleNext();
              } else {
                onComplete(profile);
              }
            }}
            disabled={!currentQ.isValid}
            className="w-full py-3 bg-nebula text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4 flex items-center justify-center space-x-2"
          >
            <span>{step === questions.length - 1 ? 'Complete Assessment' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
