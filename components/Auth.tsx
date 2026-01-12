import React from 'react';
import { User } from '../types';
import { Moon, User as UserIcon } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  
  const handleGoogleLogin = () => {
    // Mock login
    const mockUser: User = {
      id: 'g-123',
      name: 'Alex Doe',
      email: 'alex.doe@example.com',
      isGuest: false,
      avatar: 'https://picsum.photos/100/100', // Random avatar
      assessmentHistory: []
    };
    onLogin(mockUser);
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      isGuest: true,
      assessmentHistory: []
    };
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-midnight rounded-3xl shadow-xl overflow-hidden">
         <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">SleepTrack AI</h1>
            <p className="text-indigo-100 mt-2 text-center">Master your sleep with intelligent insights.</p>
            
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
         </div>

         <div className="p-8 space-y-6">
            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="group-hover:text-slate-900">Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center">
                 <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                 <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
                 <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <button 
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-center space-x-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-all"
              >
                <UserIcon className="w-5 h-5" />
                <span>Continue as Guest</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 px-8">
              By continuing, you agree to our Terms of Service and Privacy Policy. Gemini API key required for full features.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Auth;