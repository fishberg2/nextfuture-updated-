import React, { useState, useEffect } from 'react';
import { College, CareerPath } from '../types';
import { getCareerPath } from '../services/gemini';
import { Loader2, ArrowRight, TrendingUp, Building2, Users, ExternalLink, Lightbulb, GraduationCap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CareerPathViewProps {
  initialCollege: College | null;
  darkMode?: boolean;
}

const CareerPathView: React.FC<CareerPathViewProps> = ({ initialCollege, darkMode = false }) => {
  const [college, setCollege] = useState<College | null>(initialCollege);
  const [careerGoal, setCareerGoal] = useState('');
  const [path, setPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCollege(initialCollege);
  }, [initialCollege]);

  const generatePath = async () => {
    if (!college || !careerGoal) return;
    setLoading(true);
    try {
      const data = await getCareerPath(college, careerGoal);
      setPath(data);
    } catch (e) {
      console.error(e);
      alert("Could not generate roadmap. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!college) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        Please select a college from your Saved list first.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8 transition-colors">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Design Your Future at {college.name}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Enter your dream job, and we'll create a step-by-step roadmap tailored to this institution.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Software Engineer, Marine Biologist..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={generatePath}
            disabled={loading || !careerGoal}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {path && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
               <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Salary Potential</h3>
               <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                 ${path.salaryProjections.entryLevel.toLocaleString()} - ${path.salaryProjections.seniorLevel.toLocaleString()}
               </div>
               <p className="text-xs text-slate-400 mt-1">Entry to Senior Level</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors md:col-span-2">
               <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Key Skills</h3>
               <div className="flex flex-wrap gap-2">
                 {path.skills.hard.map((skill, i) => (
                   <span key={`hard-${i}`} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded font-medium">{skill}</span>
                 ))}
                 {path.skills.soft.map((skill, i) => (
                   <span key={`soft-${i}`} className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs px-2 py-1 rounded font-medium">{skill}</span>
                 ))}
               </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timeline & Employers */}
            <div className="lg:col-span-2 space-y-8">
              {/* Roadmap */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Career Roadmap</h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                  <div className="space-y-8">
                    {path.roadmap.map((stage, idx) => (
                      <div key={idx} className="relative pl-8 border-l-2 border-indigo-100 dark:border-indigo-900 last:border-0">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900"></div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{stage.stageName}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 mb-3">{stage.description}</p>
                        <ul className="space-y-2">
                          {stage.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <ArrowRight className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0"/>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Potential Employers */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  Where You Can Work
                </h3>
                <div className="grid gap-4">
                  {path.potentialEmployers.map((emp, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {emp.name}
                          <a 
                            href={emp.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </h4>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                          <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                             <Lightbulb className="h-3 w-3" /> How to get hired
                          </h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {emp.hiringTips}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                          <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                             <GraduationCap className="h-3 w-3" /> What you'll learn
                          </h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {emp.learningOutcomes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Charts/Info */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Salary Growth</h3>
                  <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Entry', salary: path.salaryProjections.entryLevel },
                        { name: 'Mid', salary: path.salaryProjections.midLevel },
                        { name: 'Senior', salary: path.salaryProjections.seniorLevel }
                      ]}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                         <XAxis dataKey="name" tick={{fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b'}} axisLine={false} tickLine={false}/>
                         <YAxis hide/>
                         <Tooltip 
                            contentStyle={{ 
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              color: darkMode ? '#f8fafc' : '#0f172a',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                         />
                         <Area type="monotone" dataKey="salary" stroke="#4f46e5" fill="#e0e7ff" fillOpacity={darkMode ? 0.2 : 1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Full Skills List Sidebar Block */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skill Requirements</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Hard Skills</h4>
                    <ul className="space-y-2">
                      {path.skills.hard.map((skill, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2">Soft Skills</h4>
                    <ul className="space-y-2">
                      {path.skills.soft.map((skill, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>

               <div className="bg-indigo-900 dark:bg-indigo-950 rounded-2xl shadow-sm p-6 text-white">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="h-5 w-5"/> Networking Tips</h3>
                  <ul className="space-y-3">
                    {path.networkingTips.map((tip, i) => (
                      <li key={i} className="text-sm opacity-90 leading-relaxed border-b border-indigo-800 pb-2 last:border-0 last:pb-0">
                        {tip}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPathView;