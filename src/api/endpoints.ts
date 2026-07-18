// One function per live backend route (see src/types/index.ts for how this
// was derived from the running API's /openapi.json). Grouped by resource,
// not wrapped in a class - there's no shared instance state beyond the
// fetch wrapper itself.
import { apiFetch } from './client'
import type {
  ApplicationRead,
  HRUserInvite,
  HRUserRead,
  IngestTranscriptInput,
  JobRequisitionCreate,
  JobRequisitionRead,
  JobRequisitionStatus,
  OrganizationCreate,
  OrganizationRead,
  SubmitApplicationInput,
  TranscriptRead,
  VerdictRead,
  VerdictServiceType,
} from '../types'

export const api = {
  health: {
    check: () => apiFetch<{ status: string }>('/health'),
  },

  organizations: {
    create: (body: OrganizationCreate) => apiFetch<OrganizationRead>('/organizations', { method: 'POST', json: body }),
    read: (organizationId: string) => apiFetch<OrganizationRead>(`/organizations/${organizationId}`),
    deactivate: (organizationId: string) =>
      apiFetch<OrganizationRead>(`/organizations/${organizationId}/deactivate`, { method: 'PATCH' }),
  },

  hrUsers: {
    invite: (body: HRUserInvite) => apiFetch<HRUserRead>('/hr-users', { method: 'POST', json: body }),
    read: (hrUserId: string) => apiFetch<HRUserRead>(`/hr-users/${hrUserId}`),
    activate: (hrUserId: string) => apiFetch<HRUserRead>(`/hr-users/${hrUserId}/activate`, { method: 'PATCH' }),
    deactivate: (hrUserId: string) => apiFetch<HRUserRead>(`/hr-users/${hrUserId}/deactivate`, { method: 'PATCH' }),
  },

  requisitions: {
    create: (body: JobRequisitionCreate) => apiFetch<JobRequisitionRead>('/requisitions', { method: 'POST', json: body }),
    read: (requisitionId: string) => apiFetch<JobRequisitionRead>(`/requisitions/${requisitionId}`),
    updateStatus: (requisitionId: string, status: JobRequisitionStatus) =>
      apiFetch<JobRequisitionRead>(`/requisitions/${requisitionId}/status`, { method: 'PATCH', json: { status } }),
  },

  applications: {
    submit: (input: SubmitApplicationInput) => {
      const form = new FormData()
      form.set('job_requisition_id', input.job_requisition_id)
      form.set('candidate_email', input.candidate_email)
      form.set('candidate_full_name', input.candidate_full_name)
      if (input.candidate_phone) form.set('candidate_phone', input.candidate_phone)
      form.set('file', input.file)
      return apiFetch<ApplicationRead>('/applications', { method: 'POST', form })
    },
  },

  transcripts: {
    ingest: (input: IngestTranscriptInput) => {
      const form = new FormData()
      if (input.text) form.set('text', input.text)
      if (input.language) form.set('language', input.language)
      if (input.audio_file) form.set('audio_file', input.audio_file)
      return apiFetch<TranscriptRead>(`/interviews/${input.interview_id}/transcript`, { method: 'POST', form })
    },
  },

  verdicts: {
    read: (applicationId: string, serviceType: VerdictServiceType) =>
      apiFetch<VerdictRead>(`/applications/${applicationId}/verdicts/${serviceType}`),
  },
}
