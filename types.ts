export interface College {
  name: string;
  city: string;
  state: string;
  acceptanceRate: number; // e.g. 0.15 for 15%
  annualCost: number;
  description: string;
  reasonForFit: string;
  institutionType: 'Public' | 'Private' | 'Liberal Arts' | 'Technical' | 'Other';
}

export interface ComparisonAnalysis {
  comparisons: {
    collegeName: string;
    pros: string[];
    cons: string[];
  }[];
  costEffectiveness: {
    collegeName: string;
    score: number; // 0-100
    justification: string;
  }[];
  overallRecommendation: string;
}

export interface CareerPath {
  careerTitle: string;
  potentialCareers: string[];
  skills: {
    hard: string[];
    soft: string[];
  };
  salaryProjections: {
    entryLevel: number;
    midLevel: number;
    seniorLevel: number;
  };
  potentialEmployers: {
    name: string;
    websiteUrl: string;
    hiringTips: string;
    learningOutcomes: string;
  }[];
  networkingTips: string[];
  roadmap: {
    stageName: string;
    description: string;
    actionItems: string[];
  }[];
}

export interface TranscriptAnalysisResult {
  inferredCareerGoal: string;
  suggestedDegrees: string[];
  suggestedColleges: College[];
}

export interface User {
  name: string;
  email: string;
  passwordHash: string; // Mock hash
  confirmed: boolean;
}

export interface FinancialAidInfo {
  grants: string[];
  loans: string[];
  tips: string[];
}

export interface Scholarship {
  name: string;
  amount: string;
  deadline: string;
  eligibility: string;
}

export interface StudentJob {
  title: string;
  type: 'On-Campus' | 'Internship' | 'Part-Time';
  description: string;
  payRange: string;
}