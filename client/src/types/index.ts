export interface Topic {
  id: string;
  name: string;
  score: number;
  analyzeQuestionId: string;
}

export interface Resource {
  id: string;
  type: string;
  title: string;
  url: string;
  relevanceScore: number;
  analyzeQuestionId: string;
}

export interface Paper {
  id: string;
  name: string;
  year: string;
  analyzeQuestionId: string;
}

export interface AnalysisResult {
  id: string;
  question: string;
  frequency: number;
  importance: number;
  answer: string;
  topics: Topic[];
  resources: Resource[];
  papers: Paper[];
}

export interface FileWithPreview extends File {
  preview?: string;
}