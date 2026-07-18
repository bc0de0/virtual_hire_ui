// Mirrors the virtual_hire backend's live OpenAPI schema exactly (pulled
// from GET /openapi.json against the running Sift API), field-for-field and
// endpoint-for-endpoint - not the aspirational data model in the backend's
// docs/05-data-model.md. Several documented entities (candidates, resumes,
// interviews, proctoring sessions/events) have no implemented routes yet -
// there is deliberately no type for them here. Add one only once a route
// exists to back it.

export type OrganizationStatus = 'active' | 'suspended' | 'deactivated'

export interface OrganizationRead {
  id: string
  name: string
  status: OrganizationStatus
  created_at: string
  updated_at: string
}

export interface OrganizationCreate {
  name: string
}

export type HRUserRole = 'hr_generalist' | 'recruiter' | 'hiring_manager'
export type HRUserStatus = 'invited' | 'active' | 'deactivated'

export interface HRUserRead {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: HRUserRole
  status: HRUserStatus
  created_at: string
  updated_at: string
}

export interface HRUserInvite {
  email: string
  full_name: string
  role: HRUserRole
}

export type JobRequisitionStatus = 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled'

export interface JobRequisitionRead {
  id: string
  organization_id: string
  title: string
  department: string | null
  owner_hr_user_id: string
  status: JobRequisitionStatus
  scorecard_template: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface JobRequisitionCreate {
  title: string
  department?: string | null
  owner_hr_user_id: string
  scorecard_template: Record<string, unknown>
}

export type ApplicationStatus = 'submitted' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn'

export interface ApplicationRead {
  id: string
  organization_id: string
  candidate_id: string
  job_requisition_id: string
  resume_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

// POST /applications is multipart/form-data - see api.submitApplication.
export interface SubmitApplicationInput {
  job_requisition_id: string
  candidate_email: string
  candidate_full_name: string
  candidate_phone?: string | null
  file: File
}

export type TranscriptStatus = 'pending' | 'available' | 'unavailable'
export type TranscriptSource = 'platform_provided' | 'generated_stt'

export interface TranscriptRead {
  id: string
  interview_id: string
  status: TranscriptStatus
  source: TranscriptSource | null
  language: string | null
  created_at: string
  updated_at: string
}

// POST /interviews/{interview_id}/transcript is multipart/form-data - at
// least one of text/audio_file is required (backend returns 400 otherwise).
export interface IngestTranscriptInput {
  interview_id: string
  text?: string | null
  language?: string | null
  audio_file?: File | null
}

// Only these two service types have a generation pipeline wired up on the
// backend today - 'interview_proctoring' from the wider data model has no
// verdict route yet, so it's intentionally excluded here.
export type VerdictServiceType = 'resume_analysis' | 'transcript_assignment_review'
export type VerdictLabel = 'pass' | 'review' | 'fail'

export interface VerdictRead {
  id: string
  application_id: string
  service_type: VerdictServiceType
  verdict_label: VerdictLabel
  narrative: string
  generated_at: string
  stale: boolean
}
