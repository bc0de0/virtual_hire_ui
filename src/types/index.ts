// These types mirror the virtual_hire backend's Postgres schema field-for-field
// (see virtual_hire/docs/05-data-model.md). Field names stay snake_case to match
// the wire format FastAPI/Pydantic v2 will emit — the backend has no camelCase
// aliasing configured, so this is what the real API will actually return once
// its routes exist (as of this writing the backend is schema/docs-only, no
// implemented endpoints besides /health).

export type CandidateStatus = 'active' | 'archived' | 'deleted'

export interface Candidate {
  id: string
  organization_id: string
  email: string
  full_name: string
  phone: string | null
  status: CandidateStatus
  created_at: string
  updated_at: string
}

export type ResumeStatus = 'uploaded' | 'parsing' | 'parsed' | 'parse_failed'
export type EmbeddingStatus = 'not_embedded' | 'embedding' | 'embedded' | 'embed_failed'

export interface Resume {
  id: string
  candidate_id: string
  file_object_key: string
  status: ResumeStatus
  embedding_status: EmbeddingStatus
  parse_error: string | null
  created_at: string
}

export type JobRequisitionStatus = 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled'

export interface JobRequisition {
  id: string
  title: string
  department: string | null
  status: JobRequisitionStatus
}

export type ApplicationStatus = 'submitted' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  candidate_id: string
  job_requisition_id: string
  resume_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Interview {
  id: string
  application_id: string
  interviewer_hr_user_id: string
  scheduled_at: string
  status: InterviewStatus
}

export type TranscriptStatus = 'pending' | 'available' | 'unavailable'
export type TranscriptSource = 'platform_provided' | 'generated_stt'

export interface Transcript {
  id: string
  interview_id: string
  status: TranscriptStatus
  source: TranscriptSource | null
  text: string | null
  language: string | null
}

export type ProctoringPlatform = 'zoom' | 'google_meet' | 'teams' | 'other'

// Per invariant I15: proctoring analysis is always asynchronous and advisory,
// post-interview only. There is deliberately no "in progress, being watched
// live" concept — 'active' below means the interview is underway on the video
// platform, not that analysis is happening in real time.
export type ProctoringSessionStatus = 'not_configured' | 'consent_pending' | 'active' | 'analyzing' | 'completed' | 'failed'

export interface ProctoringSession {
  id: string
  interview_id: string
  platform: ProctoringPlatform
  external_meeting_ref: string | null
  candidate_consented_at: string | null
  interviewer_consented_at: string | null
  status: ProctoringSessionStatus
  failure_reason: string | null
}

export type ProctoringEventType =
  | 'multiple_faces_detected'
  | 'face_not_detected'
  | 'gaze_away'
  | 'voice_mismatch'
  | 'background_voice_detected'
  | 'other'

export type ProctoringSeverity = 'info' | 'warning' | 'critical'

export interface ProctoringEvent {
  id: string
  proctoring_session_id: string
  event_type: ProctoringEventType
  severity: ProctoringSeverity
  detected_at: string
  confidence: number | null
}

export type VerdictServiceType = 'resume_analysis' | 'interview_proctoring' | 'transcript_assignment_review'

// Deliberately a 3-tier label, never a bare numeric score (see the backend's
// "narrative over bare number" posture in docs/05-data-model.md).
export type VerdictLabel = 'pass' | 'review' | 'fail'

export interface Verdict {
  id: string
  application_id: string
  service_type: VerdictServiceType
  deterministic_score: Record<string, number | string | boolean>
  verdict_label: VerdictLabel
  narrative: string
  generated_at: string
  stale: boolean
}

// --- Denormalized / joined shapes ---
// The raw tables above don't carry these fields; list-view API responses are
// expected to join them in for display (same pattern EPIC.md's endpoint
// descriptions imply, e.g. "ranked list of candidates with rationale text").

export interface CandidateListItem extends Candidate {
  role_title: string
  application_status: ApplicationStatus
  latest_verdict_label: VerdictLabel | null
}

export interface InterviewListItem extends Interview {
  candidate_name: string
}
