export type PipelineStage = 'screening' | 'assessment' | 'interview' | 'decision'

export type Recommendation = 'Recommended' | 'Borderline' | 'Not Recommended'

export interface Candidate {
  id: string
  name: string
  role: string
  email: string
  stage: PipelineStage
  resumeUrl: string
  lastUpdated: string
  score: number
  summary: string
  tags: string[]
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  scheduledAt: string
  durationMinutes: number
  status: 'Scheduled' | 'In Progress' | 'Completed'
  channel: 'Video' | 'Async'
  link: string
  notes: string
}

export interface TranscriptSegment {
  id: string
  speaker: 'Interviewer' | 'Candidate'
  timestamp: string
  text: string
}

export interface ProctorEvent {
  id: string
  type: 'tab-switch' | 'multiple-faces' | 'background-noise' | 'face-off-screen'
  severity: 'info' | 'warning' | 'critical'
  timestamp: string
  label: string
  description: string
}

export interface VerdictReport {
  id: string
  candidateId: string
  recommendation: Recommendation
  confidence: number
  summary: string
  strengths: string[]
  gaps: string[]
  citations: Array<{
    quote: string
    timestamp: string
  }>
  generatedAt: string
}
