import type { LucideIcon } from 'lucide-react';
import { BookOpen, Brain, Database, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';

export type Contributor = {
  name: string;
  contact: string;
  course: string;
  college: string;
  address: string;
  github_username: string;
};

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: BookOpen },
  { label: 'AI Assistant', href: '/assistant', icon: Brain },
  { label: 'Power BI', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Viewer', href: '/viewer', icon: Database },
  { label: 'Login', href: '/login', icon: ShieldCheck },
  { label: 'Admin Console', href: '/admin', icon: Users },
];

export const projectCards = [
  {
    title: 'RAG Architecture',
    value: 'React -> FastAPI -> ChromaDB -> Gemini',
    detail: 'Complete pipeline for document ingestion, semantic chunking, vector search, and LLM context synthesis.',
  },
  {
    title: 'Technology Stack',
    value: 'React, FastAPI, PostgreSQL, Gemini, ChromaDB',
    detail: 'Modern enterprise stack with sharp light-themed interface and real-time backend API integration.',
  },
  {
    title: 'Multi-Format Documents',
    value: 'PDF, DOCX, TXT, CSV, PPTX',
    detail: 'Extract text, build embeddings, store vector representations, and query workforce policy & HR knowledge.',
  },
  {
    title: 'Unified Admin Hub',
    value: 'Users, Profile, Team, Docs, PowerBI, Datasets',
    detail: 'All administrative capabilities accessible in a single sharp-edged dashboard.',
  },
];

export const architectureLayers = [
  'React Frontend (TypeScript, Vite, Lucide Icons, Sharp Light Design System)',
  'FastAPI Backend (Async REST Services, CORS Middleware, Document Ingestion Engine)',
  'Gemini API Integration (Prompt Synthesis, Grounded Workforce Answering)',
  'ChromaDB Vector Retrieval (Document Chunking, Semantic Search, Context Match)',
  'PostgreSQL / Neon Database (Persistent Admin Profiles, Settings & Metadata)',
];

export const supportingDocuments = [
  'README.md - Project setup and architecture documentation',
  'Contributing.md - Guidelines for open-source contributions',
  'CODE_OF_CONDUCT.md - Community code of conduct guidelines',
  'SECURITY.md - Security policies and reporting process',
  'contributors.json - Official contributor metadata store',
  'raw-DATASET.csv - 1,470 HR attrition & workforce dataset records',
];

export const policyKnowledgeBaseCategories = [
  { id: 'HR_Policy', label: 'HR Policy', desc: 'Employee code of conduct & general HR rules' },
  { id: 'Leave_Policy', label: 'Leave Policy', desc: 'Paid annual, sick, and parental leave rules' },
  { id: 'Attendance_Policy', label: 'Attendance Policy', desc: 'Working hours, shifts & attendance tracking' },
  { id: 'Work_From_Home_Policy', label: 'Work From Home Policy', desc: 'Remote work eligibility & WFH guidelines' },
  { id: 'Recruitment_Policy', label: 'Recruitment Policy', desc: 'Hiring standards, referrals & onboarding' },
  { id: 'Learning_Development_Policy', label: 'Learning & Development Policy', desc: 'Training programs, certifications & skill development' },
  { id: 'Performance_Management_Policy', label: 'Performance Management Policy', desc: 'KPI reviews, appraisal cycles & promotions' },
  { id: 'Data_Privacy_Policy', label: 'Data Privacy Policy', desc: 'Employee data protection & privacy compliance' },
  { id: 'IT_Security_Policy', label: 'IT Security Policy', desc: 'Device usage, password policies & cybersecurity' },
  { id: 'Travel_Expense_Policy', label: 'Travel Expense Policy', desc: 'Business travel allowances & expense reimbursement' },
  { id: 'Benefits_Policy', label: 'Benefits Policy', desc: 'Health insurance, wellness & employee perks' },
  { id: 'FAQ', label: 'FAQ Knowledge', desc: 'Frequently asked workforce questions' },
];

export const suggestedQuestions = [
  "What is the company's leave policy entitlement and approval process?",
  "What are the guidelines and eligibility for Work From Home (WFH)?",
  "How are business travel expenses and per diem allowances reimbursed?",
  "What are the employee data protection rules under Data Privacy & IT Security Policy?",
  "How are performance appraisal cycles and promotions managed?",
  "What benefits, insurance, and wellness perks are provided under Benefits Policy?",
  "Summarize key FAQs for new employee onboarding and attendance rules.",
];

export const uploadTypes = ['PDF', 'DOCX', 'TXT', 'CSV', 'PPTX'];

export const fallbackContributors: Contributor[] = [
  {
    name: 'Saurabh Kumar',
    contact: 'contact@gu-saurabh.site',
    course: 'BCA',
    college: 'Galgotias University',
    address: 'Greater Noida, UP',
    github_username: 'Saurabhtbj1201',
  },
  {
    name: 'Aishwarya Zade',
    contact: 'aishwaryazade2002@gmail.com',
    course: 'BTech',
    college: 'LSPGCOE Ratnagiri',
    address: 'Gadchiroli, Maharashtra',
    github_username: 'Ashuzade',
  },
  {
    name: 'Pratyush Sarkar',
    contact: 'pratyush2003sarkar@gmail.com',
    course: 'B.Tech CSE',
    college: 'University of Engineering and Management, Kolkata',
    address: 'Kolkata, West Bengal',
    github_username: 'Pratyush562003',
  },
  {
    name: 'Sanjivani Gurav',
    contact: 'sanjivanigurav106@gmail.com',
    course: 'MSc',
    college: 'Vivekanand College, Kolhapur',
    address: 'Pune, Maharashtra',
    github_username: 'Sanjivani0101',
  },
];

export const adminModules = [
  'Manage Admins & Session Status',
  'My Profile & Password',
  'Team Members Contribution Management',
  'Chatbot Assistant Documents (Upload, Delete, View)',
  'Power BI Dashboard Link Configuration',
  'Dataset Upload & 32-Attribute Validation',
];

export const dataAttributes = [
  'Age',
  'Attrition',
  'BusinessTravel',
  'DailyRate',
  'Department',
  'DistanceFromHome',
  'Education',
  'EducationField',
  'EmployeeNumber',
  'EnvironmentSatisfaction',
  'Gender',
  'HourlyRate',
  'JobInvolvement',
  'JobLevel',
  'JobRole',
  'JobSatisfaction',
  'MaritalStatus',
  'MonthlyIncome',
  'MonthlyRate',
  'NumCompaniesWorked',
  'OverTime',
  'PercentSalaryHike',
  'PerformanceRating',
  'RelationshipSatisfaction',
  'StockOptionLevel',
  'TotalWorkingYears',
  'TrainingTimesLastYear',
  'WorkLifeBalance',
  'YearsAtCompany',
  'YearsInCurrentRole',
  'YearsSinceLastPromotion',
  'YearsWithCurrManager',
];
