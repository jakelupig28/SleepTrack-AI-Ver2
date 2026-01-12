import React from 'react';
import { ViewState, User } from '../types';
import { LayoutDashboard, FlaskConical, History, LogOut, Sun, Moon as MoonIcon, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, currentView, setView, onLogout, isDark, toggleTheme 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'bg-nebula/10 text-nebula dark:bg-nebula/20 dark:text-nebula font-semibold' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-nebula' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-void overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-midnight/50 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula to-purple-600 flex items-center justify-center">
              <MoonIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula to-purple-600">
              SleepTrack AI
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={ViewState.SLEEP_LAB} icon={FlaskConical} label="Sleep Lab" />
          <NavItem view={ViewState.JOURNAL} icon={History} label="Assessment History" />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 px-2">
             <div className="flex items-center space-x-2">
               {user.avatar ? (
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                   {user.name.charAt(0)}
                 </div>
               )}
               <div className="flex flex-col">
                 <span className="text-sm font-medium dark:text-white truncate max-w-[100px]">{user.name}</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400">{user.isGuest ? 'Guest' : 'Pro Plan'}</span>
               </div>
             </div>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <MoonIcon className="w-4 h-4 text-slate-600" />}
             </button>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-midnight border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula to-purple-600 flex items-center justify-center">
              <MoonIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold dark:text-white">SleepTrack AI</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
           {isMobileMenuOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-midnight pt-20 px-4 animate-fade-in">
           <nav className="space-y-2">
              <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
              <NavItem view={ViewState.SLEEP_LAB} icon={FlaskConical} label="Sleep Lab" />
              <NavItem view={ViewState.JOURNAL} icon={History} label="Assessment History" />
              <div className="border-t border-slate-200 dark:border-slate-800 my-4 pt-4">
                 <button onClick={toggleTheme} className="flex items-center space-x-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400">
                    {isDark ? <Sun className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    <span>Switch Theme</span>
                 </button>
                 <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-red-500">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                 </button>
              </div>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
