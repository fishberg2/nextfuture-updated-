import { GoogleGenAI, Type, Schema } from "@google/genai";
import { College, ComparisonAnalysis, CareerPath, TranscriptAnalysisResult } from "../types";

// Using gemini-3-flash-preview as reliable model for text and multimodal tasks
const MODEL_NAME = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schemas
const collegeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    city: { type: Type.STRING },
    state: { type: Type.STRING },
    acceptanceRate: { type: Type.NUMBER, description: "Decimal value, e.g. 0.25 for 25%" },
    annualCost: { type: Type.NUMBER, description: "Average annual cost in USD" },
    description: { type: Type.STRING },
    reasonForFit: { type: Type.STRING },
    institutionType: { type: Type.STRING, enum: ['Public', 'Private', 'Liberal Arts', 'Technical', 'Other'] }
  },
  required: ['name', 'city', 'state', 'acceptanceRate', 'annualCost', 'description', 'reasonForFit', 'institutionType']
};

const collegeListSchema: Schema = {
  type: Type.ARRAY,
  items: collegeSchema
};

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    comparisons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          collegeName: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['collegeName', 'pros', 'cons']
      }
    },
    costEffectiveness: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          collegeName: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Score from 0 to 100" },
          justification: { type: Type.STRING }
        },
        required: ['collegeName', 'score', 'justification']
      }
    },
    overallRecommendation: { type: Type.STRING }
  },
  required: ['comparisons', 'costEffectiveness', 'overallRecommendation']
};

const careerPathSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    careerTitle: { type: Type.STRING },
    potentialCareers: { type: Type.ARRAY, items: { type: Type.STRING } },
    skills: {
      type: Type.OBJECT,
      properties: {
        hard: { type: Type.ARRAY, items: { type: Type.STRING } },
        soft: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['hard', 'soft']
    },
    salaryProjections: {
      type: Type.OBJECT,
      properties: {
        entryLevel: { type: Type.NUMBER },
        midLevel: { type: Type.NUMBER },
        seniorLevel: { type: Type.NUMBER }
      },
      required: ['entryLevel', 'midLevel', 'seniorLevel']
    },
    potentialEmployers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          websiteUrl: { type: Type.STRING },
          hiringTips: { type: Type.STRING },
          learningOutcomes: { type: Type.STRING }
        },
        required: ['name', 'websiteUrl', 'hiringTips', 'learningOutcomes']
      }
    },
    networkingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stageName: { type: Type.STRING },
          description: { type: Type.STRING },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['stageName', 'description', 'actionItems']
      }
    }
  },
  required: ['careerTitle', 'potentialCareers', 'skills', 'salaryProjections', 'potentialEmployers', 'networkingTips', 'roadmap']
};

const transcriptAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    inferredCareerGoal: { type: Type.STRING },
    suggestedDegrees: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedColleges: { type: Type.ARRAY, items: collegeSchema }
  },
  required: ['inferredCareerGoal', 'suggestedDegrees', 'suggestedColleges']
};


// Services
export const findColleges = async (job: string, location: string, excludedColleges: string[] = []): Promise<College[]> => {
  const exclusionText = excludedColleges.length > 0 
    ? `Do not include these colleges: ${excludedColleges.join(', ')}.` 
    : '';
  const prompt = `I want to be a ${job}. I am looking for colleges near ${location}. Suggest 6 colleges that are a good fit. Include public, private, and varied options. ${exclusionText}`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: collegeListSchema,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as College[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const findCollegesFromTranscript = async (base64Image: string, mimeType: string): Promise<TranscriptAnalysisResult | null> => {
  const prompt = "Analyze this academic transcript. Infer the student's strengths and potential career goals. Based on this, suggest 3 specific potential career paths and 4 colleges that would be a good fit for these strengths. Return valid JSON.";
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: transcriptAnalysisSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TranscriptAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Transcript Error:", error);
    throw error;
  }
};

export const compareColleges = async (colleges: College[]): Promise<ComparisonAnalysis | null> => {
  const collegeNames = colleges.map(c => c.name).join(", ");
  const prompt = `Compare the following colleges: ${collegeNames}. Analyze pros/cons, cost effectiveness (ROI), and give an overall recommendation for a student interested in a balanced college experience.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ComparisonAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Gemini Compare Error:", error);
    throw error;
  }
};

export const getCareerPath = async (college: College, careerGoal: string): Promise<CareerPath | null> => {
  const prompt = `Create a detailed career roadmap for a student attending ${college.name} aiming to become a ${careerGoal}. Include salary projections, a breakdown of key hard and soft skills, and a list of specific potential employers with their website URLs, tips on how to get hired there, and what working there teaches you.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: careerPathSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CareerPath;
    }
    return null;
  } catch (error) {
    console.error("Gemini Career Path Error:", error);
    throw error;
  }
};

export const getFinancialAidTips = async (): Promise<string[]> => {
    try {
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: "Give 5 top financial aid tips for US college students in JSON array format.",
          config: {
              responseMimeType: "application/json",
              responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
      });
      return response.text ? JSON.parse(response.text) : [];
    } catch (error) {
      console.error("Gemini Financial Aid Error:", error);
      return [];
    }
}