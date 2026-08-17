export type JobStatus =
  | 'uploaded'
  | 'parsing'
  | 'understanding'
  | 'designing'
  | 'generating'
  | 'verifying'
  | 'repairing'
  | 'ready'
  | 'failed';

export interface DocumentPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
}

export interface DocumentPackage {
  filename: string;
  sourceType: 'pdf' | 'docx' | 'image' | 'text';
  fileSizeBytes: number;
  extractedText: string;
  pages: DocumentPage[];
  metadata: Record<string, any>;
}

export interface SectionBrief {
  sectionTitle: string;
  questionRange: string;
  type: string;
  points: number;
}

export interface PaperBrief {
  title: string;
  subject: string;
  grade: string;
  estimatedDuration: number;
  totalPoints: number;
  totalQuestions: number;
  sections: SectionBrief[];
  hasMathFormulas: boolean;
  hasImages: boolean;
  specialNotes: string[];
}

export interface ExperiencePlan {
  style: 'minimal-academic' | 'modern-comic' | 'high-school-contest';
  layout: {
    desktop: string;
    mobile: string;
  };
  navigation: 'sidebar-index' | 'top-progress' | 'stepper';
  interactions: string[];
  scoringMode: 'instant-auto' | 'submit-once';
  explanationMode: 'drawer-after-submit' | 'immediate-reveal';
}

export interface StepLog {
  step: JobStatus;
  title: string;
  message: string;
  timestamp: number;
  percent: number;
}

export interface GenerationJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: JobStatus;
  progressPercent: number;
  fileName: string;
  brief?: PaperBrief;
  experiencePlan?: ExperiencePlan;
  htmlArtifact?: string;
  steps: StepLog[];
  error?: string;
}
