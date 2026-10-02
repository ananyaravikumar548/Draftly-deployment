import { z } from 'zod';

export const AnalysisSchema = z.object({
  company_name: z.string().min(1).max(160),
  job_title: z.string().min(1).max(160),
  hr_email: z.string().email().nullable(),
  match_score: z.number().int().min(0).max(100),
  match_reasoning: z.string().min(1).max(700),
  summary: z.string().min(1).max(700),
  selected_skills: z.array(z.string().max(80)).max(30),
  selected_items: z.array(z.object({
    item_id: z.string(),
    reason: z.string().min(1).max(300),
    bullets: z.array(z.string().min(1).max(260)).max(3),
  })).max(4),
  skill_gaps: z.array(z.string().max(80)).max(30),
  email_subject: z.string().min(1).max(200),
  email_body: z.string().min(1).max(4000),
});

export const ResumeSchema = z.object({
  profile: z.object({ full_name: z.string(), role: z.string().default(''), email: z.string(), phone: z.string(), location: z.string(), linkedin: z.string(), github: z.string() }),
  summary: z.string(),
  skills: z.array(z.string()),
  items: z.array(z.object({ item_id: z.string(), title: z.string(), item_type: z.string(), date_range: z.string(), technologies: z.array(z.string()), bullets: z.array(z.string()) })),
  achievements: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
  education: z.array(z.object({ school: z.string(), degree: z.string(), field: z.string(), start: z.string(), end: z.string(), grade: z.string() })),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

export type ApplicationRecord = {
  _id: import('mongodb').ObjectId;
  company_name: string;
  job_title: string;
  job_url: string | null;
  job_text: string;
  location: string;
  analysis: Analysis;
  resume_json: ResumeData;
  recipient_email: string;
  status: 'Analyzed' | 'Draft Created' | 'Applied' | 'Interview' | 'Rejected';
  created_at: Date;
  updated_at: Date;
};
