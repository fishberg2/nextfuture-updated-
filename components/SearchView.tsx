import React, { useState } from 'react';
import { findColleges, findCollegesFromTranscript } from '../services/gemini';
import { College, TranscriptAnalysisResult } from '../types';
import { Search, Upload, MapPin, Briefcase, Plus, Check, Loader2, FileText, DollarSign, BookOpen, Star, Sparkles, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchViewProps {
  onSaveCollege: (college: College) => void;
  savedCollegeNames: string[];
}

const ITEMS_PER_PAGE = 6;

const SearchView: React.FC<SearchViewProps> = ({ onSaveCollege, savedCollegeNames }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'transcript'>('manual');
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<College[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterType, setFilterType] = useState<string>('All');
  
  // Manual Search State
  const [job, setJob] = useState('');
  const [location, setLocation] = useState('');

  // Transcript State
  const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !location) return;
    setLoading(true);
    setAllResults([]);
    setCurrentPage(0);
    setTranscriptAnalysis(null);
    setFilterType('All');
    try {
      const colleges = await findColleges(job, location);
      setAllResults(colleges);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setAllResults([]);
    setCurrentPage(0);
    setTranscriptAnalysis(null);
    setFilterType('All');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      const mimeType = file.type;

      try {
        const analysis = await findCollegesFromTranscript(base64Data, mimeType);
        if (analysis) {
          setTranscriptAnalysis(analysis);
          setAllResults(analysis.suggestedColleges);
          // Set inferred job to enable pagination context
          setJob(analysis.inferredCareerGoal);
          if (!location) setLocation("United States");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to analyze transcript.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    // Check if we have enough results for the next page
    if (allResults.length > nextPage * ITEMS_PER_PAGE) {
      setCurrentPage(nextPage);
      return;
    }

    // Otherwise, fetch more
    setLoading(true);
    try {
      // Use job and location (either entered manually or inferred)
      const searchTerm = job || (transcriptAnalysis?.inferredCareerGoal ?? "General Studies");
      const searchLocation = location || "United States";
      
      const newColleges = await findColleges(
        searchTerm, 
        searchLocation, 
        allResults.map(c => c.name) // Exclude existing
      );
      
      if (newColleges.length > 0) {
        setAllResults(prev => [...prev, ...newColleges]);
        setCurrentPage(nextPage);
      } else {
        alert("No more colleges found for this criteria.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load more colleges.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getFitIndicator = (reason: string) => {
    const r = reason.toLowerCase();
    if (r.includes('cost') || r.includes('afford') || r.includes('financial') || r.includes('tuition')) {
      return { 
        icon: DollarSign, 
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', 
        label: 'Financial Fit' 
      };
    }
    if (r.includes('location') || r.includes('near') || r.includes('city') || r.includes('close')) {
      return { 
        icon: MapPin, 
        color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
        label: 'Location Fit' 
      };
    }
    if (r.includes('academic') || r.includes('program') || r.includes('major') || r.includes('rank')) {
      return { 
        icon: BookOpen, 
        color: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', 
        label: 'Academic Fit' 
      };
    }
    if (r.includes('career') || r.includes('job') || r.includes('employ') || r.includes('industry')) {
      return { 
        icon: Briefcase, 
        color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', 
        label: 'Career Fit' 
      };
    }
    if (r.includes('culture') || r.includes('life') || r.includes('social') || r.includes('vibe')) {
      return { 
        icon: Sparkles, 
        color: 'text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800', 
        label: 'Cultural Fit' 
      };
    }
    return { 
      icon: Star, 
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800', 
      label: 'Overall Fit' 
    };
  };

  // Determine which results to display based on page
  const pageResults = allResults.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const filteredResults = filterType === 'All' 
    ? pageResults 
    : pageResults.filter(c => c.institutionType === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row w-full sm:w-auto transition-colors">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
              activeTab === 'manual' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Manual Search
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
              activeTab === 'transcript' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Transcript Analysis
          </button>
        </div>
      </div>

      {/* Search Forms */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 max-w-3xl mx-auto transition-colors">
        {activeTab === 'manual' ? (
          <form onSubmit={handleManualSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Career Goal (e.g. Data Scientist)"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={job}
                onChange={(e) => setJob(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Location (e.g. CA)"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </form>
        ) : (
          <div className="text-center">
             <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleTranscriptUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full mb-3">
                    <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {fileName ? fileName : 'Upload Transcript Image'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {fileName ? 'Click to change file' : 'PNG, JPG up to 5MB. AI will analyze your strengths.'}
                  </p>
                </div>
             </div>
             {loading && <div className="mt-4 flex justify-center text-sm text-indigo-600 dark:text-indigo-400 items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Analyzing transcript...</div>}
          </div>
        )}
      </div>

      {/* Transcript Insights */}
      {transcriptAnalysis && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5"/> AI Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">Inferred Goal:</span>
              <p className="text-slate-700 dark:text-slate-300">{transcriptAnalysis.inferredCareerGoal}</p>
            </div>
            <div>
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">Suggested Degrees:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {transcriptAnalysis.suggestedDegrees.map((d, i) => (
                  <span key={i} className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 text-xs font-medium">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {allResults.length > 0 && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mr-2 shrink-0">
               <Filter className="h-4 w-4 mr-1" /> Filter:
            </div>
            {['All', 'Public', 'Private', 'Liberal Arts', 'Technical', 'Other'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  filterType === type
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p>No colleges found matching the selected filter on this page.</p>
                <p className="text-sm mt-2">Try switching filters or load the next set of colleges.</p>
              </div>
            ) : (
              filteredResults.map((college, idx) => {
                const isSaved = savedCollegeNames.includes(college.name);
                const fitIndicator = getFitIndicator(college.reasonForFit);
                const FitIcon = fitIndicator.icon;
                
                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all flex flex-col group">
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-block px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                          {college.institutionType}
                        </span>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                           {(college.acceptanceRate * 100).toFixed(0)}% Acceptance
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{college.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" /> {college.city}, {college.state}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 flex-1">{college.description}</p>
                      
                      {/* Visual Fit Indicator */}
                      <div className={`mt-auto rounded-lg border p-3 flex gap-3 ${fitIndicator.color}`}>
                        <div className="mt-0.5">
                          <FitIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">{fitIndicator.label}</p>
                          <p className="text-sm font-medium leading-snug">{college.reasonForFit}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ${college.annualCost.toLocaleString()}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">/yr</span>
                      </div>
                      <button
                        onClick={() => !isSaved && onSaveCollege(college)}
                        disabled={isSaved}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          isSaved 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default' 
                            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white'
                        }`}
                      >
                        {isSaved ? <><Check className="h-3 w-3" /> Saved</> : <><Plus className="h-3 w-3" /> Save</>}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">
               Page {currentPage + 1}
            </div>
            <div className="flex gap-2">
               <button
                 onClick={handlePrevPage}
                 disabled={currentPage === 0 || loading}
                 className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
               >
                 <ChevronLeft className="h-4 w-4" /> Previous
               </button>
               <button
                 onClick={handleNextPage}
                 disabled={loading}
                 className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
               >
                 {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Next'} <ChevronRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;