export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CLIENT = 'client',
}

export interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
  branding?: Branding;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'single-choice'
  | 'multiple-choice'
  | 'rating'
  | 'nps'
  | 'ces'
  | 'image-choice'
  | 'file-upload'
  | 'video';

export interface SurveyQuestion {
  id: string; // Frontend generated unique ID (e.g., UUID)
  text: string;
  type: QuestionType;
  options?: string[]; // For single-choice, multiple-choice
  isRequired?: boolean;
  maxRating?: number; // For rating
  allowedFileTypes?: string; // For file-upload
  videoUrl?: string; // For video
}

export interface Survey {
  id: string; // Corresponds to _id from MongoDB
  title: string;
  description: string;
  companyId?: string; // Made optional, or ensure it's always set by backend
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed';
  responseCount: number;
  questions: SurveyQuestion[]; // Array of questions
  createdBy?: string; // ObjectId as string, ref User
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  data: Record<string, any>;
  createdAt: string;
  isFlagged?: boolean;
  location?: {
    state?: string;
    city?: string;
    region?: string;
  };
  demographics?: {
    age?: string;
    gender?: string;
    occupation?: string;
    income?: string;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'radar' | 'heatmap' | 'scorecard';
  dataSource: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Dashboard {
  id: string;
  title: string;
  companyId: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  surveyId: string;
  surveyName?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
  status: 'draft' | 'published';
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  content: ReportContent[];
  // Adding fields for the new sections
  projectName?: string;
  background?: string;
  objectives?: string;
  methodology?: string;
  respondentProfile?: {
    location?: string;
    gender?: string;
    age?: string;
    occupation?: string;
    income?: string;
    outletType?: string;
  };
  executiveSummary?: string;
  coreInsightAreas?: {
    brandAwareness?: string;
    brandUsage?: string;
    customerSatisfaction?: string;
    challenges?: string;
    outletDynamics?: string;
    productStocking?: string;
    supplyMethods?: string;
    tradeMargins?: string;
    tradeCustomerLifecycle?: string;
    driversOfPurchase?: string;
    marketingChannels?: string;
    csat?: number;
    nps?: number;
    ces?: number;
  };
  regionalFindings?: string;
  recommendations?: string;
}

export type ReportContent = 
  | { type: 'text'; value: string }
  | { type: 'chart'; chartId: string; config: Record<string, any> }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'table'; data: any[]; headers: string[] };