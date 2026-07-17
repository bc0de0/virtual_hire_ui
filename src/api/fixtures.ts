import type {
  CandidateListItem,
  InterviewListItem,
  ProctoringEvent,
  ProctoringSession,
  Resume,
  Transcript,
  Verdict,
} from '../types'

export const candidates: CandidateListItem[] = [
  {
    id: 'candidate-101',
    organization_id: 'org-1',
    email: 'maya.chen@example.com',
    full_name: 'Maya Chen',
    phone: null,
    status: 'active',
    role_title: 'Senior Frontend Engineer',
    application_status: 'interviewing',
    latest_verdict_label: 'pass',
    created_at: '2026-07-10T09:00:00Z',
    updated_at: '2026-07-16T12:00:00Z',
  },
  {
    id: 'candidate-102',
    organization_id: 'org-1',
    email: 'daniel.ortiz@example.com',
    full_name: 'Daniel Ortiz',
    phone: null,
    status: 'active',
    role_title: 'Product Designer',
    application_status: 'screening',
    latest_verdict_label: 'review',
    created_at: '2026-07-14T09:00:00Z',
    updated_at: '2026-07-16T09:00:00Z',
  },
  {
    id: 'candidate-103',
    organization_id: 'org-1',
    email: 'nadia.brooks@example.com',
    full_name: 'Nadia Brooks',
    phone: null,
    status: 'active',
    role_title: 'Data Analyst',
    application_status: 'submitted',
    latest_verdict_label: null,
    created_at: '2026-07-15T09:00:00Z',
    updated_at: '2026-07-15T09:00:00Z',
  },
  {
    id: 'candidate-104',
    organization_id: 'org-1',
    email: 'owen.patel@example.com',
    full_name: 'Owen Patel',
    phone: null,
    status: 'active',
    role_title: 'Solutions Engineer',
    application_status: 'offer',
    latest_verdict_label: 'pass',
    created_at: '2026-07-05T09:00:00Z',
    updated_at: '2026-07-15T19:00:00Z',
  },
  {
    id: 'candidate-105',
    organization_id: 'org-1',
    email: 'sasha.kim@example.com',
    full_name: 'Sasha Kim',
    phone: null,
    status: 'active',
    role_title: 'Machine Learning Engineer',
    application_status: 'interviewing',
    latest_verdict_label: null,
    created_at: '2026-07-12T09:00:00Z',
    updated_at: '2026-07-16T09:00:00Z',
  },
]

export const resumes: Resume[] = [
  { id: 'resume-101', candidate_id: 'candidate-101', file_object_key: 'org-1/resume-101/maya-chen.pdf', status: 'parsed', embedding_status: 'embedded', parse_error: null, created_at: '2026-07-10T09:05:00Z' },
  { id: 'resume-102', candidate_id: 'candidate-102', file_object_key: 'org-1/resume-102/daniel-ortiz.pdf', status: 'parsed', embedding_status: 'embedded', parse_error: null, created_at: '2026-07-14T09:05:00Z' },
  { id: 'resume-103', candidate_id: 'candidate-103', file_object_key: 'org-1/resume-103/nadia-brooks.pdf', status: 'parsing', embedding_status: 'not_embedded', parse_error: null, created_at: '2026-07-15T09:05:00Z' },
  { id: 'resume-104', candidate_id: 'candidate-104', file_object_key: 'org-1/resume-104/owen-patel.pdf', status: 'parsed', embedding_status: 'embedded', parse_error: null, created_at: '2026-07-05T09:05:00Z' },
  { id: 'resume-105', candidate_id: 'candidate-105', file_object_key: 'org-1/resume-105/sasha-kim.pdf', status: 'parse_failed', embedding_status: 'not_embedded', parse_error: 'Unsupported PDF encoding', created_at: '2026-07-12T09:05:00Z' },
]

export const interviews: InterviewListItem[] = [
  {
    id: 'interview-201',
    application_id: 'application-101',
    interviewer_hr_user_id: 'hr-user-1',
    candidate_name: 'Maya Chen',
    scheduled_at: '2026-07-17T14:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'interview-202',
    application_id: 'application-102',
    interviewer_hr_user_id: 'hr-user-1',
    candidate_name: 'Daniel Ortiz',
    scheduled_at: '2026-07-17T16:30:00Z',
    status: 'scheduled',
  },
  {
    id: 'interview-203',
    application_id: 'application-104',
    interviewer_hr_user_id: 'hr-user-2',
    candidate_name: 'Owen Patel',
    scheduled_at: '2026-07-15T10:30:00Z',
    status: 'completed',
  },
]

// Backend models a Transcript as a single ingested text blob (status + source),
// not per-utterance segments — there is no speaker/timestamp structure on the
// wire. The Review page derives paragraph breaks from this text client-side.
export const transcript: Transcript = {
  id: 'transcript-1',
  interview_id: 'interview-203',
  status: 'available',
  source: 'platform_provided',
  language: 'en',
  text:
    "Interviewer: Can you walk us through the system you built for onboarding new hires?\n\n" +
    'Candidate: We built a lightweight workflow that handled document intake and gave the team a shared view of candidate progress.\n\n' +
    'Interviewer: How did you handle ambiguity when requirements shifted?\n\n' +
    'Candidate: I framed the problem in terms of user outcomes and paired that with a small experiment to validate the direction quickly.',
}

// Per invariant I15, proctoring analysis is asynchronous and post-interview
// only — this session reflects a completed interview whose recording has
// already been reviewed, not a live in-progress call.
export const proctoringSession: ProctoringSession = {
  id: 'proctoring-1',
  interview_id: 'interview-203',
  platform: 'zoom',
  external_meeting_ref: 'zoom-meeting-88213409',
  candidate_consented_at: '2026-07-15T10:25:00Z',
  interviewer_consented_at: '2026-07-15T10:20:00Z',
  status: 'completed',
  failure_reason: null,
}

export const proctoringEvents: ProctoringEvent[] = [
  { id: 'event-1', proctoring_session_id: 'proctoring-1', event_type: 'gaze_away', severity: 'warning', detected_at: '2026-07-15T10:30:31Z', confidence: 0.81 },
  { id: 'event-2', proctoring_session_id: 'proctoring-1', event_type: 'multiple_faces_detected', severity: 'info', detected_at: '2026-07-15T10:30:46Z', confidence: 0.64 },
  { id: 'event-3', proctoring_session_id: 'proctoring-1', event_type: 'background_voice_detected', severity: 'warning', detected_at: '2026-07-15T10:31:18Z', confidence: 0.73 },
]

export const verdicts: Verdict[] = [
  {
    id: 'verdict-1',
    application_id: 'application-101',
    service_type: 'resume_analysis',
    deterministic_score: { skills_match: 0.88, experience_fit: 0.82, requirement_gaps: 1 },
    verdict_label: 'pass',
    narrative: 'Candidate demonstrated strong technical clarity, an ownership mindset, and thoughtful collaboration habits.',
    generated_at: '2026-07-16T12:15:00Z',
    stale: false,
  },
  {
    id: 'verdict-2',
    application_id: 'application-104',
    service_type: 'transcript_assignment_review',
    deterministic_score: { rubric_score: 0.74, communication: 0.9, technical_depth: 0.58 },
    verdict_label: 'review',
    narrative: 'Strong stakeholder fit but the evidence for technical depth was incomplete.',
    generated_at: '2026-07-15T19:00:00Z',
    stale: false,
  },
]
