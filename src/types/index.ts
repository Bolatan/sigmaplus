export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CLIENT = 'client',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed';
  responseCount: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  data: Record<string, any>;
  createdAt: string;
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
}

export type ReportContent = 
  | { type: 'text'; value: string }
  | { type: 'chart'; chartId: string; config: Record<string, any> }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'table'; data: any[]; headers: string[] };