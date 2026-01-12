import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import SleepLab from './components/SleepLab';
import Journal from './components/Journal';
import OnboardingQuiz from './components/OnboardingQuiz';
import { User, ViewState, SleepSession, UserProfile } from './types';
import { analyzeUserProfile } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleAddSession = (session: SleepSession) => {
    setSessions(prev => [...prev, session]);
    setView(ViewState.DASHBOARD);
  };

  const handleLogin = (loggedInUser: User) => {
    const userWithHistory = {
      ...loggedInUser,
      assessmentHistory: loggedInUser.assessmentHistory || []
    };
    setUser(userWithHistory);
    setView(ViewState.DASHBOARD);
  };

  const handleStartAssessment = () => {
    setView(ViewState.ONBOARDING);
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setIsProcessingProfile(true);
    try {
      const analysisRaw = await analyzeUserProfile(profile);
      const analysis = analysisRaw.replace(/\*/g, '');
      
      const fullProfile: UserProfile = { 
        ...profile, 
        aiAnalysis: analysis,
        date: new Date().toISOString()
      };
      
      if (user) {
        const updatedHistory = [fullProfile, ...(user.assessmentHistory || [])];
        setUser({ 
          ...user, 
          profile: fullProfile,
          assessmentHistory: updatedHistory
        });
      }
    } catch (err) {
      console.error("Profile analysis failed:", err);
      // Fallback if AI fails
      if (user) {
        const fallbackProfile = { ...profile, date: new Date().toISOString() };
        setUser({ ...user, profile: fallbackProfile, assessmentHistory: [fallbackProfile, ...(user.assessmentHistory || [])] });
      }
    } finally {
      setIsProcessingProfile(false);
      setView(ViewState.DASHBOARD);
    }
  };

  if (!user) {
    return (
      <div className={isDark ? "dark" : ""}>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  if (view === ViewState.ONBOARDING) {
    if (isProcessingProfile) {
      return (
        <div className={`flex items-center justify-center min-h-screen ${isDark ? "dark bg-void text-white" : "bg-slate-50 text-slate-900"}`}>
           <div className="text-center">
             <div className="w-12 h-12 border-4 border-nebula border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <h2 className="text-xl font-bold">Dr. Somnus is analyzing your profile...</h2>
             <p className="opacity-70">Creating your personalized sleep hygiene prescription.</p>
           </div>
        </div>
      );
    }
    return (
      <div className={isDark ? "dark" : ""}>
        <OnboardingQuiz 
          onComplete={handleOnboardingComplete} 
          onCancel={() => setView(ViewState.DASHBOARD)}
        />
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <Layout 
        user={user} 
        currentView={view} 
        setView={setView} 
        onLogout={() => { setUser(null); }}
        isDark={isDark}
        toggleTheme={toggleTheme}
      >
        {view === ViewState.DASHBOARD && (
          <Dashboard 
            sessions={sessions} 
            user={user} 
            onStartAssessment={handleStartAssessment}
          />
        )}
        {view === ViewState.SLEEP_LAB && <SleepLab />}
        {view === ViewState.JOURNAL && <Journal user={user} />}
      </Layout>
    </div>
  );
};

export default App;