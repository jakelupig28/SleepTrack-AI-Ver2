import React from 'react';
import { SleepSession, User, ChatMessage, UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Battery, Zap, Brain, MessageSquare, ClipboardList, Sparkles, User as UserIcon, Clock, Coffee, AlertCircle } from 'lucide-react';
import { getSleepCoachChat } from '../services/geminiService';

interface DashboardProps {
  sessions: SleepSession[];
  user: User;
  onStartAssessment: () => void;
}

const ChartCard = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="bg-white dark:bg-midnight/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
    <h3 className="text-lg font-semibold mb-6 dark:text-white">{title}</h3>
    <div className="h-64">
      {children}
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
  <div className="bg-white dark:bg-midnight/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-all hover:scale-[1.02]">
    <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <h4 className="text-2xl font-bold dark:text-white mt-1">{value}</h4>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ sessions, user, onStartAssessment }) => {
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const lastSession = sessions[sessions.length - 1] || null;
  const hasHistory = sessions.length > 0;

  // --- Metrics Calculation Logic ---
  let displayQuality = '--';
  let displayDuration = '--';
  let displayDeepSleep = '--';
  let displayEfficiency = '--';

  const parseDurationString = (dur: string): number => {
      if (dur === '< 5 hours') return 270;
      if (dur === '5-6 hours') return 330;
      if (dur === '6-7 hours') return 390;
      if (dur === '7-8 hours') return 450;
      if (dur === '8+ hours') return 510;
      return 480;
  };

  if (hasHistory) {
    // 1. Calculate from actual Sessions
    const averageQuality = Math.round(
      sessions.reduce((acc, curr) => acc + curr.quality, 0) / sessions.length
    );
    const totalSleepMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const averageDuration = Math.round(totalSleepMinutes / sessions.length);
    const efficiency = Math.min(98, Math.round(averageQuality * 1.1));

    displayQuality = `${averageQuality}%`;
    displayDuration = `${Math.floor(averageDuration / 60)}h ${averageDuration % 60}m`;
    displayDeepSleep = lastSession ? `${lastSession.stages.deep}m` : '--';
    displayEfficiency = `${efficiency}%`;

  } else if (user.profile) {
    // 2. Estimate from Profile if no sessions exist
    const p = user.profile;
    const estDurationMin = parseDurationString(p.averageSleepDuration);
    
    displayDuration = `${Math.floor(estDurationMin / 60)}h ${estDurationMin % 60}m`;

    // Estimate Quality
    let estQuality = 85;
    if (p.dailyCaffeine === '2-3 Cups') estQuality -= 5;
    if (p.dailyCaffeine === '4+ Cups') estQuality -= 15;
    const issuesCount = p.sleepIssues.filter(i => i !== 'None').length;
    estQuality -= (issuesCount * 8);
    estQuality = Math.max(40, Math.min(95, estQuality));
    
    // Clean numbers, no tildes
    displayQuality = `${estQuality}%`;
    displayEfficiency = `${Math.round(estQuality * 1.05)}%`;
    displayDeepSleep = `${Math.round(estDurationMin * 0.2)}m`;
  }

  // --- Chart Data Logic ---
  let chartData: any[] = [];
  let isAssessmentData = false;

  if (sessions.length > 0) {
    chartData = sessions;
  } else if (user.assessmentHistory && user.assessmentHistory.length > 0) {
    isAssessmentData = true;
    const sortedHistory = [...user.assessmentHistory].reverse();
    
    chartData = sortedHistory.map((h, index) => {
        let dateVal;
        if (h.date) {
            // Fix: Parse ISO date to local date string to avoid timezone shifts
            const d = new Date(h.date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateVal = `${year}-${month}-${day}`;
        } else {
            dateVal = `Assessment ${index + 1}`;
        }
        
        return {
            date: dateVal,
            durationMinutes: parseDurationString(h.averageSleepDuration),
            quality: 75,
        };
    });
  }

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputMessage, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const responseText = await getSleepCoachChat(chatHistory, userMsg.text, lastSession);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setChatHistory(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.startsWith('Assessment')) return dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    // Note: Month is 0-indexed in Date constructor
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your sleep health overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 bg-nebula/10 text-nebula px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Readiness: {displayEfficiency}</span>
          </div>

          <button 
            onClick={onStartAssessment}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
             <ClipboardList className="w-4 h-4" />
             <span className="text-sm font-semibold">{user.profile ? 'Retake Assessment' : 'Take Sleep Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Profile & Insights Section */}
      {user.profile ? (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden animate-fade-in">
           <div className="absolute top-0 right-0 w-96 h-96 bg-nebula rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Profile Summary */}
             <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                <h3 className="text-lg font-bold flex items-center space-x-2 text-indigo-200">
                  <UserIcon className="w-5 h-5" />
                  <span>Profile Summary</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-indigo-300 mb-1">Caffeine</p>
                      <p className="font-semibold flex items-center"><Coffee className="w-3 h-3 mr-1"/> {user.profile.dailyCaffeine}</p>
                   </div>
                   <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-indigo-300 mb-1">Avg Sleep</p>
                      <p className="font-semibold flex items-center"><Clock className="w-3 h-3 mr-1"/> {user.profile.averageSleepDuration}</p>
                   </div>
                   <div className="bg-white/5 rounded-lg p-3 col-span-2">
                      <p className="text-xs text-indigo-300 mb-1">Key Issues</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.profile.sleepIssues.map(i => (
                          <span key={i} className="text-xs bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full">{i}</span>
                        ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* AI Analysis */}
             <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold flex items-center space-x-2 text-indigo-200">
                   <Sparkles className="w-5 h-5 text-yellow-300" />
                   <span>AI Sleep Hygiene Prescription</span>
                </h3>
                <div className="bg-white/5 rounded-xl p-4 text-sm leading-relaxed text-indigo-50 border border-white/10 whitespace-pre-line">
                   {user.profile.aiAnalysis ? user.profile.aiAnalysis : "Analysis pending..."}
                </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-midnight/50 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <ClipboardList className="w-8 h-8" />
           </div>
           <div>
             <h3 className="text-lg font-semibold dark:text-white">Complete Your Sleep Profile</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
               Take our 7-question assessment to get personalized sleep hygiene advice and deeper analysis from our AI.
             </p>
           </div>
           <button 
             onClick={onStartAssessment}
             className="bg-nebula hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
           >
             Start Assessment
           </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Battery} 
          label="Sleep Quality" 
          value={displayQuality} 
          subtext={hasHistory ? "Avg over recorded sessions" : "Estimated from Profile"} 
          color="bg-emerald-500 text-emerald-500" 
        />
        <StatCard 
          icon={Activity} 
          label="Avg Duration" 
          value={displayDuration} 
          subtext={hasHistory ? "Avg over recorded sessions" : "Estimated from Profile"} 
          color="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          icon={Brain} 
          label="Deep Sleep" 
          value={displayDeepSleep} 
          subtext={hasHistory ? "Last night (Estimated)" : "Estimated Daily Avg"} 
          color="bg-purple-500 text-purple-500" 
        />
        <StatCard 
          icon={Zap} 
          label="Efficiency" 
          value={displayEfficiency}
          subtext="Sleep Quality Index" 
          color="bg-orange-500 text-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2">
          <ChartCard title={isAssessmentData ? "Assessment History Trends" : "Sleep Duration History"}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${Math.round(val/60)}h`}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Duration Minutes']}
                  />
                  <Area type="monotone" dataKey="durationMinutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDuration)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p>No sleep data recorded yet.</p>
                <p className="text-xs mt-1">Visit Sleep Lab to optimize your rest.</p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* AI Chat Section */}
        <div className="lg:col-span-1 bg-white dark:bg-midnight/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px] lg:h-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
               <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Dr. Somnus</h3>
              <p className="text-xs text-slate-500">AI Sleep Coach</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
            {chatHistory.length === 0 && (
              <div className="text-center mt-10 opacity-50">
                <Brain className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-500">Ask me anything about your sleep schedule or improving rest.</p>
              </div>
            )}
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-nebula text-white rounded-br-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3">
                     <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                     </div>
                  </div>
               </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800">
             <div className="relative">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your sleep..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-nebula dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-2 top-2 p-1.5 bg-nebula text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
