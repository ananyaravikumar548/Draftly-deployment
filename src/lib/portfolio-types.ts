import { z } from 'zod';

export const ProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().or(z.literal('')),
  phone: z.string().trim().max(50),
  location: z.string().trim().max(120),
  linkedin: z.string().trim().max(240),
  github: z.string().trim().max(240),
  role: z.string().trim().max(120),
  bio: z.string().trim().max(600),
  education: z.array(z.object({ school: z.string(), degree: z.string(), field: z.string(), start: z.string(), end: z.string(), grade: z.string() })).max(8),
});

export const PortfolioItemSchema = z.object({
  type: z.enum(['project', 'experience', 'skill', 'education', 'certification', 'achievement']),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(3000),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30),
  dateRange: z.string().trim().max(100),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileDocument = Profile & { _id: string };
export type PortfolioItem = z.infer<typeof PortfolioItemSchema> & { id: string; createdAt?: string };
export type PortfolioRecord = Omit<PortfolioItem, 'id' | 'createdAt'> & { _id: import('mongodb').ObjectId; createdAt: Date };

// Entirely fictional candidate used to make the local classroom demo self-contained.
export const demoProfile: Profile = {
  fullName: 'Alex Morgan', email: 'alex.morgan@example.com', phone: '+1 (202) 555-0147',
  location: 'Bengaluru, India', linkedin: 'linkedin.com/in/alex-morgan-demo', github: 'github.com/alex-morgan-demo',
  role: 'Junior Data Analyst & Frontend Developer',
  bio: 'Computer science graduate with project and internship experience in analytics and frontend development. Builds clear dashboards and accessible web interfaces using SQL, Python, React, and TypeScript.',
  education: [{ school: 'Westbridge Institute of Technology (Fictional)', degree: 'Bachelor of Science', field: 'Computer Science', start: '2021', end: '2025', grade: 'GPA: 3.78 / 4.00' }],
};

export const demoPreUniversityEducation = {
  school: 'Demo Pre-University College', degree: 'Pre-University Course', field: 'Commerce', start: '2021', end: '2023', grade: 'Demo',
};

export const demoPortfolioItems = [
  {
    type: 'experience' as const, title: 'Data Analyst Intern · Juniper Market Insights',
    description: 'Prepared and analyzed retail sales data for weekly merchandising reviews. Cleaned and joined 18,400 transaction rows from five source files with Python and SQL, then documented validation checks for missing values, duplicate orders, and inconsistent product categories. Built a Tableau dashboard for revenue, units sold, and inventory movement across six product categories. Automated the recurring report workflow, reducing preparation time from about three hours to 45 minutes per week. Presented findings, with concise written explanations of charts and limitations, to a five-person non-technical operations team.',
    technologies: ['SQL', 'Python', 'Pandas', 'PostgreSQL', 'Tableau', 'Excel'], dateRange: 'Jun 2025 – Dec 2025',
  },
  {
    type: 'experience' as const, title: 'Frontend Developer Intern · Brightpath Digital',
    description: 'Built and maintained responsive React and TypeScript interfaces for a customer support portal. Delivered eight reusable page and form components, connected search and ticket views to REST endpoints, and added loading, empty, and error states. Improved keyboard navigation, semantic landmarks, form labels, and color contrast against WCAG 2.1 AA checks. Worked with a designer and two engineers through Git pull requests and weekly reviews; reduced the main dashboard bundle by 21% through route-level code splitting.',
    technologies: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'REST APIs', 'CSS', 'Git'], dateRange: 'May 2024 – Aug 2024',
  },
  {
    type: 'project' as const, title: 'Subscription Retention Analysis',
    description: 'Analyzed a fictional subscription dataset covering 12,600 customer accounts to understand early churn patterns. Used SQL and PostgreSQL to build cohort tables, then used Python and Pandas to compare retention by plan type, signup month, and support activity. Built an interactive Power BI report with retention curves, slicers, and a plain-language findings page. A validation notebook checks cohort denominators and missing cancellation dates; the final walkthrough explains the main trends to a non-technical product audience.',
    technologies: ['SQL', 'Python', 'Pandas', 'PostgreSQL', 'Power BI', 'Statistics', 'Data Visualization'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Accessible Event Booking Platform',
    description: 'Created a responsive event discovery and booking experience using React, TypeScript, and Next.js. Implemented searchable event cards, filter controls, a multi-step booking form, and API-backed confirmation states. Added keyboard-first interaction, visible focus states, semantic page structure, and screen-reader labels. Added component tests for filtering and form validation and documented setup and design decisions for contributors.',
    technologies: ['React', 'TypeScript', 'Next.js', 'JavaScript', 'REST APIs', 'Jest', 'Accessibility'], dateRange: '2024',
  },
  {
    type: 'project' as const, title: 'Campus Services Portal',
    description: 'Built a student-facing portal prototype that brings campus announcements, room bookings, and service requests into one responsive interface. Modeled the request workflow, created reusable React components, and used PostgreSQL seed data to demonstrate status updates and basic reporting. Ran five moderated usability sessions with classmates and revised navigation labels and form feedback based on observed friction.',
    technologies: ['React', 'TypeScript', 'PostgreSQL', 'Figma', 'User Research'], dateRange: '2023 – 2024',
  },
  {
    type: 'project' as const, title: 'Sales Demand Forecasting System',
    description: 'Built a sales forecasting system using Python and historical retail data. Cleaned missing values and seasonal patterns using Pandas, engineered time-based features, and trained regression and time-series models with scikit-learn. Compared forecasting errors across models and visualized actual versus predicted sales using Matplotlib.',
    technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Machine Learning', 'Time Series', 'Data Analysis'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'E-Commerce REST API',
    description: 'Developed a backend REST API for an e-commerce application using Node.js and Express. Implemented product, cart, order, and user management endpoints with MongoDB persistence and JWT-based authentication. Added request validation, centralized error handling, pagination, and API documentation.',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT', 'JavaScript', 'Postman', 'API Design', 'Backend Development'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Android Personal Finance Tracker',
    description: 'Created a mobile expense tracking application that allows users to record transactions, categorize spending, and view monthly summaries. Implemented local persistence, form validation, reusable UI components, and interactive spending visualizations.',
    technologies: ['Android', 'Kotlin', 'SQLite', 'Material UI', 'Mobile Development', 'Data Visualization'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Network Intrusion Detection System',
    description: 'Built a machine learning prototype for detecting suspicious network activity from structured traffic records. Performed preprocessing and feature analysis, trained classification models, evaluated precision and recall, and created a dashboard for reviewing predicted attack categories.',
    technologies: ['Python', 'Scikit-learn', 'Pandas', 'Classification', 'Cybersecurity', 'Machine Learning', 'Data Visualization'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Customer Support Ticket Classifier',
    description: 'Developed an NLP-based system that automatically categorizes customer support tickets by issue type and priority. Cleaned and transformed text data, extracted linguistic features, trained classification models, and exposed predictions through a FastAPI backend.',
    technologies: ['Python', 'NLP', 'Scikit-learn', 'FastAPI', 'REST APIs', 'Text Classification', 'Machine Learning'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Cloud Deployment Monitor',
    description: 'Created a monitoring dashboard for tracking application deployments and service health. Implemented REST endpoints for deployment events, health checks, status history, and failure reporting. Containerized the application and configured a basic CI pipeline for automated testing.',
    technologies: ['Docker', 'GitHub Actions', 'Node.js', 'Express.js', 'REST APIs', 'CI/CD', 'Linux', 'Cloud Computing'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'UI Accessibility Audit Tool',
    description: 'Built a web-based accessibility auditing tool that checks common interface issues such as missing labels, insufficient semantic structure, keyboard navigation problems, and image alternative text. Generated an issue report with severity levels and recommendations for developers.',
    technologies: ['React', 'TypeScript', 'JavaScript', 'Accessibility', 'HTML', 'CSS', 'Frontend Development'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'University Course Recommendation System',
    description: 'Developed a recommendation prototype that suggests university electives based on student interests, previous coursework, and academic preferences. Implemented feature-based similarity scoring and created an interactive interface for comparing recommended courses.',
    technologies: ['Python', 'Recommendation Systems', 'Machine Learning', 'Pandas', 'React', 'TypeScript', 'Data Analysis'], dateRange: '2024–2025',
  },
  {
    type: 'project' as const, title: 'Automated QA Test Dashboard',
    description: 'Built a dashboard for tracking automated test execution across web applications. Displayed test suites, pass/fail results, execution duration, and historical trends. Added filtering and failure summaries to help developers identify recurring issues.',
    technologies: ['TypeScript', 'React', 'Jest', 'Playwright', 'REST APIs', 'Testing', 'QA Automation', 'Data Visualization'], dateRange: '2025',
  },
  {
    type: 'project' as const, title: 'Personal Content Aggregator',
    description: 'Developed a personalized content aggregation application that retrieves articles from external APIs and organizes them by topic. Implemented API integration, category filtering, saved articles, responsive layouts, and loading/error states.',
    technologies: ['React', 'JavaScript', 'REST APIs', 'API Integration', 'CSS', 'Git', 'Frontend Development'], dateRange: '2024',
  },
  ...[
    "Dean's List",
    'Campus Hackathon Finalist',
    'Technical Project Presentation',
    'University Coding Competition',
  ].map((title) => ({
    type: 'achievement' as const,
    title,
    description: ({
      "Dean's List": 'Recognized on the Dean’s List for strong academic performance during the academic year.',
      'Campus Hackathon Finalist': 'Selected as a finalist in a university-level hackathon for developing a technology solution within the allotted competition period.',
      'Technical Project Presentation': 'Presented a software project covering system architecture, implementation decisions, and application workflow to a faculty evaluation panel.',
      'University Coding Competition': 'Participated in a university coding competition involving programming, debugging, and problem-solving challenges.',
    } as Record<string, string>)[title],
    technologies: [], dateRange: '',
  })),
  ...[
    'SQL', 'Python', 'Pandas', 'Excel', 'Tableau', 'Power BI', 'PostgreSQL', 'Data Cleaning', 'Data Visualization', 'Statistics', 'React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML', 'CSS', 'REST APIs', 'Accessibility', 'Jest', 'Git',
    'Java', 'Kotlin', 'C++', 'Tailwind CSS', 'Responsive Design', 'Frontend Development', 'Node.js', 'Express.js', 'FastAPI', 'API Design', 'JWT', 'Backend Development', 'MongoDB', 'SQLite', 'Database Design', 'NumPy', 'Scikit-learn', 'Machine Learning', 'NLP', 'Classification', 'Regression', 'Recommendation Systems', 'Time Series', 'Docker', 'GitHub Actions', 'CI/CD', 'Linux', 'Cloud Computing', 'Playwright', 'Unit Testing', 'QA Automation',
  ].map((title) => ({ type: 'skill' as const, title, description: '', technologies: [title], dateRange: '' })),
];
