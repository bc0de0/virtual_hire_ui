import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, LoaderCircle, UploadCloud } from 'lucide-react'
import { request } from '../../api/client'
import { candidates, resumes } from '../../api/fixtures'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import type { ResumeStatus } from '../../types'

async function fetchIngestionQueue() {
  return request('candidates', async () =>
    candidates.map((candidate) => ({
      candidate,
      resume: resumes.find((resume) => resume.candidate_id === candidate.id) ?? null,
    })),
  )
}

const resumeStatusLabels: Record<ResumeStatus, string> = {
  uploaded: 'Uploaded',
  parsing: 'Parsing',
  parsed: 'Parsed',
  parse_failed: 'Parse failed',
}

const resumeStatusClasses: Record<ResumeStatus, string> = {
  uploaded: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  parsing: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  parsed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  parse_failed: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

export function CandidateUploadPage() {
  const { data } = useQuery({ queryKey: ['candidates'], queryFn: fetchIngestionQueue })
  const [uploading, setUploading] = useState(false)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
            <UploadCloud size={28} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
            <p className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Drop a resume or browse to upload</p>
            <p className="mb-4 text-sm text-slate-500">
              Submitting a resume creates the Candidate, Resume, and Application rows in one request, then queues async parsing and embedding.
            </p>
            <Button onClick={() => setUploading(true)}>Upload resume</Button>
          </div>
          {uploading && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
              <LoaderCircle className="animate-spin" size={16} />
              Resume accepted — parsing and embedding queued for the retrieval pipeline.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion queue</CardTitle>
        </CardHeader>
        <CardContent>
          {(data ?? []).map(({ candidate, resume }) => (
            <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{candidate.full_name}</p>
                  <p className="text-xs text-slate-500">{candidate.role_title}</p>
                </div>
                {resume && <Badge className={resumeStatusClasses[resume.status]}>{resumeStatusLabels[resume.status]}</Badge>}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <FileText size={14} />
                <span>{resume?.file_object_key}</span>
              </div>
              {resume?.status === 'parse_failed' && resume.parse_error && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{resume.parse_error}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
