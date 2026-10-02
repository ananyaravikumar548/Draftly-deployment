export type DemoJob = {
  slug: string;
  company: string;
  title: string;
  location: string;
  email: string;
  source: string;
  text: string;
};

// Fictional postings make the demo deterministic and are clearly labeled in the UI.
export const demoJobs: DemoJob[] = [
  {
    slug: 'data-analyst', company: 'Northstar Commerce', title: 'Junior Data Analyst', location: 'Bengaluru, India', email: 'talent@northstar.example', source: 'Career page · Demo fixture',
    text: `Junior Data Analyst — Northstar Commerce\nLocation: Bengaluru, India\n\nAbout the role\nNorthstar Commerce is looking for a curious Junior Data Analyst to help teams understand product and customer performance. You will work with analysts and product managers to prepare datasets, build clear reports, and communicate findings.\n\nResponsibilities\n• Query relational data with SQL and validate data quality.\n• Use Python to clean, transform, and explore datasets.\n• Build dashboards and recurring reports with Tableau or Power BI.\n• Explain trends and findings to non-technical partners.\n\nQualifications\n• Familiarity with SQL, Python, spreadsheets, and relational databases.\n• Experience with a visualization tool such as Tableau or Power BI is helpful.\n• Clear written communication and careful attention to detail.\n• Coursework, personal projects, or internship experience may be considered.\n\nContact: talent@northstar.example\nThis is a fictional Draftly demo job posting.`,
  },
  {
    slug: 'frontend-engineer', company: 'Harbor Labs', title: 'Frontend Engineer Intern', location: 'Remote · India', email: 'careers@harborlabs.example', source: 'Career page · Demo fixture',
    text: `Frontend Engineer Intern — Harbor Labs\nLocation: Remote · India\n\nAbout the role\nHarbor Labs is seeking a frontend engineering intern to help build accessible, responsive product experiences. You will work with product design and engineering to ship features and improve existing interfaces.\n\nResponsibilities\n• Build reusable interfaces using React and TypeScript.\n• Collaborate with designers to translate interface designs into responsive pages.\n• Connect frontend experiences to REST APIs and handle loading and error states.\n• Participate in code reviews and document implementation decisions.\n\nQualifications\n• Familiarity with JavaScript, React, TypeScript, and CSS.\n• Understanding of semantic HTML, accessibility, and responsive layouts.\n• Git experience and interest in working with modern web frameworks.\n\nContact: careers@harborlabs.example\nThis is a fictional Draftly demo job posting.`,
  },
];

export function getDemoJob(slug: string) { return demoJobs.find((job) => job.slug === slug); }
