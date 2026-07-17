import type { Candidate, Interview, ProctorEvent, TranscriptSegment, VerdictReport } from '../types'

export const candidates: Candidate[] = [
  {
    id: 'cand-101',
    name: 'Maya Chen',
    role: 'Senior Frontend Engineer',
    email: 'maya.chen@example.com',
    stage: 'interview',
    resumeUrl: '/resumes/maya-chen.pdf',
    lastUpdated: '2h ago',
    score: 86,
    summary: 'Strong product sense and thoughtful system design tradeoffs.',
    tags: ['React', 'TypeScript', 'Leadership'],
  },
  {
    id: 'cand-102',
    name: 'Daniel Ortiz',
    role: 'Product Designer',
    email: 'daniel.ortiz@example.com',
    stage: 'assessment',
    resumeUrl: '/resumes/daniel-ortiz.pdf',
    lastUpdated: 'Today',
    score: 74,
    summary: 'Solid portfolio with room to strengthen product strategy depth.',
    tags: ['Figma', 'Design Systems'],
  },
  {
    id: 'cand-103',
    name: 'Nadia Brooks',
    role: 'Data Analyst',
    email: 'nadia.brooks@example.com',
    stage: 'screening',
    resumeUrl: '/resumes/nadia-brooks.pdf',
    lastUpdated: 'Yesterday',
    score: 68,
    summary: 'Clear analytical profile and strong SQL fundamentals.',
    tags: ['SQL', 'BI', 'Analytics'],
  },
  {
    id: 'cand-104',
    name: 'Owen Patel',
    role: 'Solutions Engineer',
    email: 'owen.patel@example.com',
    stage: 'decision',
    resumeUrl: '/resumes/owen-patel.pdf',
    lastUpdated: '3d ago',
    score: 91,
    summary: 'Excellent customer-facing communication and technical depth.',
    tags: ['Sales Engineering', 'APIs'],
  },
  {
    id: 'cand-105',
    name: 'Sasha Kim',
    role: 'Machine Learning Engineer',
    email: 'sasha.kim@example.com',
    stage: 'interview',
    resumeUrl: '/resumes/sasha-kim.pdf',
    lastUpdated: 'Today',
    score: 79,
    summary: 'Interesting modeling background with some gaps in deployment maturity.',
    tags: ['Python', 'ML', 'MLOps'],
  },
]

export const interviews: Interview[] = [
  {
    id: 'int-201',
    candidateId: 'cand-101',
    candidateName: 'Maya Chen',
    scheduledAt: '2026-07-16T14:00:00Z',
    durationMinutes: 45,
    status: 'In Progress',
    channel: 'Video',
    link: 'https://meet.virtual-hire.local/maya-chen',
    notes: 'Focus on ownership and team collaboration.',
  },
  {
    id: 'int-202',
    candidateId: 'cand-102',
    candidateName: 'Daniel Ortiz',
    scheduledAt: '2026-07-16T16:30:00Z',
    durationMinutes: 30,
    status: 'Scheduled',
    channel: 'Video',
    link: 'https://meet.virtual-hire.local/daniel-ortiz',
    notes: 'Review case study presentation depth.',
  },
  {
    id: 'int-203',
    candidateId: 'cand-104',
    candidateName: 'Owen Patel',
    scheduledAt: '2026-07-15T10:30:00Z',
    durationMinutes: 60,
    status: 'Completed',
    channel: 'Async',
    link: 'https://meet.virtual-hire.local/owen-patel',
    notes: 'Excellent conversational fluency.',
  },
]

export const transcriptSegments: TranscriptSegment[] = [
  { id: 'seg-1', speaker: 'Interviewer', timestamp: '00:12', text: 'Can you walk us through the system you built for onboarding new hires?' },
  { id: 'seg-2', speaker: 'Candidate', timestamp: '00:27', text: 'We built a lightweight workflow that handled document intake and gave the team a shared view of candidate progress.' },
  { id: 'seg-3', speaker: 'Interviewer', timestamp: '01:04', text: 'How did you handle ambiguity when requirements shifted?' },
  { id: 'seg-4', speaker: 'Candidate', timestamp: '01:20', text: 'I framed the problem in terms of user outcomes and paired that with a small experiment to validate the direction quickly.' },
]

export const proctorEvents: ProctorEvent[] = [
  { id: 'flag-1', type: 'tab-switch', severity: 'warning', timestamp: '00:31', label: 'Tab switch detected', description: 'Candidate navigated away for 7 seconds.' },
  { id: 'flag-2', type: 'multiple-faces', severity: 'info', timestamp: '00:46', label: 'Additional face in frame', description: 'A second face briefly appeared in the background.' },
  { id: 'flag-3', type: 'background-noise', severity: 'warning', timestamp: '01:18', label: 'Elevated noise', description: 'Background audio rose above the threshold.' },
]

export const verdicts: VerdictReport[] = [
  {
    id: 'verdict-1',
    candidateId: 'cand-101',
    recommendation: 'Recommended',
    confidence: 0.91,
    summary: 'Candidate demonstrated strong technical clarity, an ownership mindset, and thoughtful collaboration habits.',
    strengths: ['Clear system design thinking', 'Strong communication under pressure', 'Evidence of cross-functional work'],
    gaps: ['Could deepen operational scalability discussion'],
    citations: [
      { quote: 'We built a lightweight workflow...', timestamp: '00:27' },
      { quote: 'I framed the problem in terms of user outcomes...', timestamp: '01:20' },
    ],
    generatedAt: '2026-07-16T12:15:00Z',
  },
  {
    id: 'verdict-2',
    candidateId: 'cand-104',
    recommendation: 'Borderline',
    confidence: 0.74,
    summary: 'Strong stakeholder fit but the evidence for technical depth was incomplete.',
    strengths: ['Excellent rapport', 'Reasonable product instincts'],
    gaps: ['More evidence of implementation depth'],
    citations: [
      { quote: 'I framed the problem in terms of user outcomes...', timestamp: '01:20' },
    ],
    generatedAt: '2026-07-15T19:00:00Z',
  },
]
