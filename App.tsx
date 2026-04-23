import React, { useState, useEffect } from 'react';
import { User, College } from './types';
import { getSession, logOut } from './services/auth';
import AuthView from './components/AuthView';
import SearchView from './components/SearchView';
import SavedCollegesView from './components/SavedCollegesView';
import CareerPathView from './components/CareerPathView';
import { LayoutDashboard, BookOpen, Compass, LogOut, GraduationCap, Moon, Sun } from 'lucide-react';

type View = 'search' | 'saved' | 'career';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('search');
  const [savedColleges, setSavedColleges] = useState<College[]>([]);
  const [careerCollege, setCareerCollege] = useState<College | null>(null);
  
  // Theme State initialization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nsf_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nsf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nsf_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check auth
    const session = getSession();
    if (session) setUser(session);

    // Load saved colleges
    const saved = localStorage.getItem('nsf_saved_colleges');
    if (saved) setSavedColleges(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nsf_saved_colleges', JSON.stringify(savedColleges));
    }
  }, [savedColleges, user]);

  const handleLogout = () => {
    logOut();
    setUser(null);
    setView('search');
    setSavedColleges([]);
  };

  const saveCollege = (college: College) => {
    if (!savedColleges.some(c => c.name === college.name)) {
      setSavedColleges([...savedColleges, college]);
    }
  };

  const removeCollege = (name: string) => {
    setSavedColleges(savedColleges.filter(c => c.name !== name));
  };

  const navigateToCareer = (college: College) => {
    setCareerCollege(college);
    setView('career');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!user) {
    return <AuthView onLogin={setUser} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white hidden md:block">NextStepFuture</span>
            </div>
            
            {/* Center Navigation - Scrollable on mobile */}
            <div className="flex-1 flex justify-center min-w-0 mx-2 md:mx-4">
              <div className="flex space-x-1 overflow-x-auto no-scrollbar items-center py-1 max-w-full">
                <button
                  onClick={() => setView('search')}
                  className={`px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${view === 'search' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                  title="Search"
                >
                  <LayoutDashboard className={`h-5 w-5 transition-transform ${view === 'search' ? 'block' : 'opacity-70'}`} /> 
                  <span className="hidden md:inline">Search</span>
                </button>
                <button
                  onClick={() => setView('saved')}
                  className={`px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${view === 'saved' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                  title="Saved Colleges"
                >
                  <BookOpen className={`h-5 w-5 transition-transform ${view === 'saved' ? 'block' : 'opacity-70'}`} /> 
                  <span className="hidden md:inline">Saved</span> 
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${view === 'saved' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {savedColleges.length}
                  </span>
                </button>
                <button
                  onClick={() => setView('career')}
                  className={`px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${view === 'career' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                  title="Career Path"
                >
                  <Compass className={`h-5 w-5 transition-transform ${view === 'career' ? 'block' : 'opacity-70'}`} /> 
                  <span className="hidden md:inline">Career Path</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Log Out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {view === 'search' && (
          <SearchView 
            onSaveCollege={saveCollege} 
            savedCollegeNames={savedColleges.map(c => c.name)} 
          />
        )}
        {view === 'saved' && (
          <SavedCollegesView 
            colleges={savedColleges} 
            onRemove={removeCollege}
            onSetCareerCollege={navigateToCareer}
            darkMode={isDarkMode}
          />
        )}
        {view === 'career' && (
          <CareerPathView initialCollege={careerCollege} darkMode={isDarkMode} />
        )}
      </main>
    </div>
  );
};

export default App;