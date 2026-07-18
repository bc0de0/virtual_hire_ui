import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { api, ApiError } from '../../api'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { ErrorNote } from '../../components/shared/error-note'
import type { VerdictLabel, VerdictServiceType } from '../../types'

const verdictLabelClasses: Record<VerdictLabel, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  review: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  fail: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

const serviceTypeLabels: Record<VerdictServiceType, string> = {
  resume_analysis: 'Resume analysis',
  transcript_assignment_review: 'Transcript & assignment review',
}

export function VerdictReportPage() {
  const [applicationId, setApplicationId] = useState('')
  const [serviceType, setServiceType] = useState<VerdictServiceType>('resume_analysis')

  const verdict = useMutation({
    mutationFn: () => api.verdicts.read(applicationId, serviceType),
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Verdict lookup</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            GET /applications/{'{application_id}'}/verdicts/{'{service_type}'} — requires a bearer token (see Settings). A 404
            means no verdict exists yet; a generation job has just been enqueued, so poll again shortly.
          </p>
          <div>
            <Label htmlFor="application-id">Application id</Label>
            <Input id="application-id" value={applicationId} onChange={(event) => setApplicationId(event.target.value)} placeholder="uuid" />
          </div>
          <div>
            <Label htmlFor="service-type">Service type</Label>
            <Select id="service-type" value={serviceType} onChange={(event) => setServiceType(event.target.value as VerdictServiceType)}>
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={() => verdict.mutate()} disabled={!applicationId || verdict.isPending}>
            {verdict.isPending ? 'Fetching…' : 'Fetch verdict'}
          </Button>
          {verdict.isError && (
            <ErrorNote message={verdict.error instanceof ApiError ? verdict.error.message : 'Failed to fetch verdict.'} />
          )}

          {verdict.isSuccess && (
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{serviceTypeLabels[verdict.data.service_type]}</p>
                  <p className="text-xl font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">{verdict.data.verdict_label}</p>
                </div>
                <div className="flex items-center gap-2">
                  {verdict.data.stale && (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                      stale
                    </Badge>
                  )}
                  <Badge className={verdictLabelClasses[verdict.data.verdict_label]}>{verdict.data.verdict_label}</Badge>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{verdict.data.narrative}</p>
              <p className="mt-3 text-xs text-slate-500">Generated {new Date(verdict.data.generated_at).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About deterministic scores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            VerdictRead deliberately never exposes a bare numeric or sub-score — per the backend's docstring, it returns only
            <code className="mx-1 rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">verdict_label</code> and
            <code className="mx-1 rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">narrative</code>. The Scoring
            Engine's structured sub-scores exist internally but aren't part of the public API contract, so there's nothing to
            render here beyond the narrative above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
