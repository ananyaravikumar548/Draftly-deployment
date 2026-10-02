export type Application = { id: string; company: string; role: string; match: number; applied: string; status: 'Applied' | 'Interview' | 'Draft Created' | 'Rejected'; location: string; source: string };
export type PortfolioItem = { title: string; tech: string[]; description: string };
export type Skill = { name: string; level: 'Matched' | 'Partial' | 'Gap' };
export type RecruiterEmail = { to: string; subject: string; body: string };

export const applications: Application[] = [
  { id: 'acme-001', company: 'Acme Technologies', role: 'Software Engineer Intern', match: 82, applied: 'Sep 27', status: 'Draft Created', location: 'Bangalore, India', source: 'Company Careers' },
  { id: 'google-002', company: 'Google', role: 'Software Engineer Intern', match: 86, applied: 'Sep 25', status: 'Applied', location: 'Bangalore, India', source: 'LinkedIn' },
  { id: 'microsoft-003', company: 'Microsoft', role: 'Software Engineering Intern', match: 79, applied: 'Sep 23', status: 'Interview', location: 'Hyderabad, India', source: 'Company Careers' },
  { id: 'wipro-004', company: 'Wipro', role: 'AI Intern', match: 74, applied: 'Sep 21', status: 'Draft Created', location: 'Bangalore, India', source: 'Indeed' },
  { id: 'infosys-005', company: 'Infosys', role: 'Software Developer Intern', match: 81, applied: 'Sep 18', status: 'Applied', location: 'Pune, India', source: 'Company Careers' },
  { id: 'samsung-006', company: 'Samsung', role: 'Software Engineering Intern', match: 77, applied: 'Sep 15', status: 'Rejected', location: 'Noida, India', source: 'LinkedIn' },
];

export const projects: PortfolioItem[] = [
  { title: 'RVU Connect', tech: ['React Native', 'Supabase', 'TypeScript'], description: 'A campus community app connecting students with events, updates, and essential university services.' },
  { title: 'Draftly', tech: ['Next.js', 'AI', 'MongoDB'], description: 'An AI-powered job application workspace for creating thoughtful, tailored applications.' },
  { title: 'EMBLEM', tech: ['React', 'AI', 'Branding'], description: 'A creative identity exploration platform for building memorable visual brand systems.' },
];

export const skills: Skill[] = [
  { name: 'React', level: 'Matched' }, { name: 'Next.js', level: 'Matched' }, { name: 'TypeScript', level: 'Matched' }, { name: 'PostgreSQL', level: 'Matched' }, { name: 'REST APIs', level: 'Matched' }, { name: 'Cloud deployment', level: 'Partial' }, { name: 'Docker', level: 'Gap' }, { name: 'Kubernetes', level: 'Gap' },
];

export const resumeBullets = [
  'Built a React-based campus management platform supporting student workflows and real-time information access.',
  'Designed reusable TypeScript components and responsive interfaces for cross-platform application experiences.',
  'Integrated backend services and structured application data to support scalable feature development.',
];

export const recruiterEmail: RecruiterEmail = {
  to: 'recruiter@acmetech.com',
  subject: 'Application for Software Engineer Intern — Acme Technologies',
  body: 'Dear Hiring Team,\n\nI came across the Software Engineer Intern opportunity at Acme Technologies and was excited by the chance to contribute to your product engineering team.\n\nMy experience building React and TypeScript applications, including RVU Connect, has given me a strong foundation in creating thoughtful, reliable user experiences. I would welcome the opportunity to bring that experience to Acme.\n\nThank you for your time and consideration. I look forward to connecting.\n\nBest,\nAnanya Ravikumar',
};
