import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FileText, Briefcase, UploadCloud } from 'lucide-react'
import { api, ApiError } from '../../api'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { ErrorNote } from '../../components/shared/error-note'
import { EmptyState } from '../../components/shared/empty-state'
import type { ApplicationRead, ApplicationStatus } from '../../types'

const applicationStatusClasses: Record<ApplicationStatus, string> = {
  submitted: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  screening: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  interviewing: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300',
  offer: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  hired: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  withdrawn: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
}

export function CandidateUploadPage() {
  // Server responses accumulated for this browser session only - there's no
  // list-applications endpoint to reload this from, so it's real data
  // (actual POST /applications responses) rather than a persisted list.
  const [submitted, setSubmitted] = useState<ApplicationRead[]>([])

  const [reqTitle, setReqTitle] = useState('')
  const [reqDepartment, setReqDepartment] = useState('')
  const [ownerHrUserId, setOwnerHrUserId] = useState('')
  const [requisitionId, setRequisitionId] = useState('')
  const createRequisition = useMutation({
    mutationFn: () =>
      api.requisitions.create({
        title: reqTitle,
        department: reqDepartment || null,
        owner_hr_user_id: ownerHrUserId,
        scorecard_template: {},
      }),
    onSuccess: (data) => setRequisitionId(data.id),
  })

  const [candidateEmail, setCandidateEmail] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const submitApplication = useMutation({
    mutationFn: () =>
      api.applications.submit({
        job_requisition_id: requisitionId,
        candidate_email: candidateEmail,
        candidate_full_name: candidateName,
        candidate_phone: candidatePhone || null,
        file: file as File,
      }),
    onSuccess: (data) => {
      setSubmitted((prev) => [data, ...prev])
      setCandidateEmail('')
      setCandidateName('')
      setCandidatePhone('')
      setFile(null)
    },
  })

  const canSubmit = Boolean(requisitionId && candidateEmail && candidateName && file)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Requisition</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              There's no list-requisitions endpoint yet, so either create one below (POST /requisitions) or paste an existing
              requisition id you already have.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="req-title">Title</Label>
                <Input id="req-title" value={reqTitle} onChange={(event) => setReqTitle(event.target.value)} placeholder="Senior Frontend Engineer" />
              </div>
              <div>
                <Label htmlFor="req-department">Department (optional)</Label>
                <Input id="req-department" value={reqDepartment} onChange={(event) => setReqDepartment(event.target.value)} placeholder="Engineering" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="req-owner">Owner HR user id</Label>
                <Input id="req-owner" value={ownerHrUserId} onChange={(event) => setOwnerHrUserId(event.target.value)} placeholder="uuid" />
              </div>
            </div>
            <Button onClick={() => createRequisition.mutate()} disabled={!reqTitle || !ownerHrUserId || createRequisition.isPending}>
              {createRequisition.isPending ? 'Creating…' : 'Create requisition'}
            </Button>
            {createRequisition.isError && (
              <ErrorNote message={createRequisition.error instanceof ApiError ? createRequisition.error.message : 'Failed to create requisition.'} />
            )}
            <div>
              <Label htmlFor="req-id">Requisition id to submit against</Label>
              <Input id="req-id" value={requisitionId} onChange={(event) => setRequisitionId(event.target.value)} placeholder="uuid" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="candidate-email">Candidate email</Label>
                <Input id="candidate-email" type="email" value={candidateEmail} onChange={(event) => setCandidateEmail(event.target.value)} placeholder="maya.chen@example.com" />
              </div>
              <div>
                <Label htmlFor="candidate-name">Candidate full name</Label>
                <Input id="candidate-name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} placeholder="Maya Chen" />
              </div>
              <div>
                <Label htmlFor="candidate-phone">Phone (optional)</Label>
                <Input id="candidate-phone" value={candidatePhone} onChange={(event) => setCandidatePhone(event.target.value)} placeholder="+1 555 0100" />
              </div>
              <div>
                <Label htmlFor="resume-file">Resume file</Label>
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 dark:text-slate-400 dark:file:bg-indigo-500/10 dark:file:text-indigo-300"
                />
              </div>
            </div>
            <Button onClick={() => submitApplication.mutate()} disabled={!canSubmit || submitApplication.isPending}>
              <UploadCloud size={16} className="mr-2" />
              {submitApplication.isPending ? 'Submitting…' : 'Submit application'}
            </Button>
            {submitApplication.isError && (
              <ErrorNote message={submitApplication.error instanceof ApiError ? submitApplication.error.message : 'Failed to submit application.'} />
            )}
            <p className="text-xs text-slate-500">
              POST /applications creates/reuses the candidate, uploads the resume, and creates the Application in one request, then
              queues async parsing and embedding — requires a bearer token (see Settings).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted this session</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nothing submitted yet"
              description="Real POST /applications responses will appear here as you submit them. There's no list-applications endpoint to reload past submissions."
            />
          ) : (
            submitted.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-500">{application.id}</p>
                  <Badge className={applicationStatusClasses[application.status]}>{application.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">Candidate {application.candidate_id}</p>
                <p className="text-xs text-slate-500">Requisition {application.job_requisition_id}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
