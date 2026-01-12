import React from 'react';
import { User, UserProfile } from '../types';
import { ClipboardList, Calendar, User as UserIcon, Coffee, Smartphone, Moon, AlertCircle, Sparkles } from 'lucide-react';

interface HistoryProps {
  user: User;
}

const History: React.FC<HistoryProps> = ({ user }) => {
  const history = user.assessmentHistory || [];

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Unknown Date';
    return new Date(isoDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-midnight/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
         <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10 text-slate-400" />
         </div>
         <h2 className="text-2xl font-bold dark:text-white">No History Yet</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
           Complete your first sleep assessment to see your history and AI-driven insights here.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-nebula/10 rounded-xl">
             <ClipboardList className="w-6 h-6 text-nebula" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Assessment History</h1>
            <p className="text-slate-500 dark:text-slate-400">Track your sleep profile changes over time.</p>
          </div>
       </div>

       <div className="grid gap-8">
          {history.map((record, index) => (
            <div key={index} className="bg-white dark:bg-midnight/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               
               {/* Header */}
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                     <Calendar className="w-5 h-5 text-slate-400" />
                     <span className="font-semibold text-slate-700 dark:text-slate-200">
                       {formatDate(record.date)}
                     </span>
                     {index === 0 && (
                       <span className="bg-nebula/10 text-nebula text-xs px-2 py-1 rounded-full font-medium border border-nebula/20">
                         Latest
                       </span>
                     )}
                  </div>
                  <div className="flex space-x-4 text-sm text-slate-500 dark:text-slate-400">
                     <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/> {record.age} yrs • {record.gender}</span>
                  </div>
               </div>

               <div className="p-6">
                  {/* Grid Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center space-x-2 mb-2 text-orange-600 dark:text-orange-400">
                           <Coffee className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-wider">Caffeine</span>
                        </div>
                        <p className="font-semibold dark:text-slate-200">{record.dailyCaffeine}</p>
                     </div>

                     <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center space-x-2 mb-2 text-blue-600 dark:text-blue-400">
                           <Smartphone className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-wider">Screen Time</span>
                        </div>
                        <p className="font-semibold dark:text-slate-200">{record.screenTime}</p>
                     </div>

                     <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center space-x-2 mb-2 text-emerald-600 dark:text-emerald-400">
                           <Moon className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-wider">Avg Sleep</span>
                        </div>
                        <p className="font-semibold dark:text-slate-200">{record.averageSleepDuration}</p>
                     </div>

                     <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                        <div className="flex items-center space-x-2 mb-2 text-red-600 dark:text-red-400">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-wider">Issues</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                           {record.sleepIssues.map((issue, i) => (
                             <span key={i} className="text-xs bg-white dark:bg-black/20 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                               {issue}
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 relative">
                     <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="w-5 h-5 text-nebula" />
                        <h3 className="font-bold text-slate-800 dark:text-white">Dr. Somnus Analysis</h3>
                     </div>
                     <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                        {record.aiAnalysis || "Analysis not available."}
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default History;
