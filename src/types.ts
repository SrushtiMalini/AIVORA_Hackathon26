export type Language = string;

export interface UserSettings {
  language: Language;
  location: string;
  theme: 'light' | 'dark';
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'analysis' | 'strategy' | 'timeline';
  metadata?: any;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface LegalAnalysis {
  summary: string;
  relevantLaws: string[];
  options: {
    title: string;
    description: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    cost: string;
    time: string;
  }[];
  nextSteps: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  contradictions?: string[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  estimatedTime?: string;
}

export interface LegalStrategy {
  strengthScore: number;
  strengthLabel: string;
  roadmap: RoadmapStep[];
  keyRisks: string[];
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'person' | 'document' | 'event' | 'fact';
  isContradicted?: boolean;
}

export interface EvidenceLink {
  source: string;
  target: string;
  label: string;
}

export interface WarRoomData {
  nodes: EvidenceNode[];
  links: EvidenceLink[];
  opponentSwords: {
    attack: string;
    shield: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  winProbability: number;
}
