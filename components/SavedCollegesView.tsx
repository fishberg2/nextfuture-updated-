import React, { useState } from 'react';
import { College, ComparisonAnalysis } from '../types';
import { compareColleges } from '../services/gemini';
import { Trash2, BarChart2, CheckSquare, Square, Zap, DollarSign, BookOpen, Compass } from 'lucide-react';
import Chart from './Chart';

interface SavedCollegesViewProps {
  colleges: College[];
  onRemove: (name: string) => void;
  onSetCareerCollege: (college: College) => void;
  darkMode?: boolean;
}

const SavedCollegesView: React.FC<SavedCollegesViewProps> = ({ colleges, onRemove, onSetCareerCollege, darkMode = false }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSelect = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const selectedColleges = colleges.filter(c => selected.includes(c.name));
      const result = await compareColleges(selectedColleges);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 dark:text-slate-500">
        <CheckSquare className="h-16 w-16 mb-4 opacity-20" />
        <p>No colleges saved yet. Start searching!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your College List</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Select 2 or more schools to compare them with AI.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCompare}
          disabled={selected.length < 2 || loading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AI Analyzing...
            </span>
          ) : (
            <>
              <BarChart2 className="h-5 w-5 group-hover:scale-110 transition-transform" /> 
              Compare Selected ({selected.length})
            </>
          )}
        </button>
      </div>

      {/* College List - Card Grid Overhaul */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {colleges.map((c) => (
          <div 
            key={c.name}
            className={`group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
              selected.includes(c.name) 
                ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' 
                : 'border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
          >
            {/* Selection Checkbox */}
            <button 
              onClick={() => toggleSelect(c.name)}
              className={`absolute top-6 right-6 p-2 rounded-xl transition-all duration-300 transform ${
                selected.includes(c.name) 
                  ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
               {selected.includes(c.name) ? <CheckSquare className="h-5 w-5"/> : <Square className="h-5 w-5"/>}
            </button>

            <div className="pr-12 mb-6">
              <div className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                {c.institutionType}
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {c.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                 <Compass className="h-4 w-4 text-indigo-500" /> {c.city}, {c.state}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Cost/Yr
                </p>
                <p className="text-base font-black text-slate-900 dark:text-white">${c.annualCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Acceptance
                </p>
                <p className="text-base font-black text-slate-900 dark:text-white">{(c.acceptanceRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 pt-5">
              <button 
                onClick={() => onRemove(c.name)}
                className="p-3 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                title="Remove from list"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => onSetCareerCollege(c)}
                className="flex-1 bg-slate-900 dark:bg-slate-700 text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none active:scale-95"
              >
                <Zap className="h-4 w-4" /> Plan Career Path
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Section */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <Chart 
              title="Annual Cost Comparison" 
              data={colleges.filter(c => selected.includes(c.name)).map(c => ({ name: c.name, cost: c.annualCost }))}
              dataKey="cost"
              nameKey="name"
              color="#6366f1"
              unit="$"
              darkMode={darkMode}
            />
             <Chart 
              title="Acceptance Rate" 
              data={colleges.filter(c => selected.includes(c.name)).map(c => ({ name: c.name, rate: parseFloat((c.acceptanceRate * 100).toFixed(1)) }))}
              dataKey="rate"
              nameKey="name"
              color="#10b981"
              unit="%"
              darkMode={darkMode}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500"/> AI Recommendation
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              {analysis.overallRecommendation}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.comparisons.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{comp.collegeName}</h4>
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Pros</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {comp.pros.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-1">Cons</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {comp.cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500"/> Cost Effectiveness Scores
              </h3>
              <div className="space-y-4">
                {analysis.costEffectiveness.map((item, idx) => (
                   <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium dark:text-slate-200">{item.collegeName}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-1">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.justification}</p>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCollegesView;