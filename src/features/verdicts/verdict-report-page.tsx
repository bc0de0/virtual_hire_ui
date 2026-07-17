import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { request } from '../../api/client'
import { verdicts } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import type { VerdictLabel, VerdictServiceType } from '../../types'

async function fetchVerdict() {
  return request('verdicts', async () => verdicts[0])
}

const verdictLabelClasses: Record<VerdictLabel, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  review: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  fail: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

const serviceTypeLabels: Record<VerdictServiceType, string> = {
  resume_analysis: 'Resume analysis',
  interview_proctoring: 'Interview proctoring',
  transcript_assignment_review: 'Transcript & assignment review',
}

// deterministic_score's JSONB shape isn't fixed by the schema (open question in
// docs/05-data-model.md), so values are rendered as-is rather than guessed at —
// e.g. a ratio-looking 0-1 number could just as easily be an integer count.
function formatScoreValue(value: number | string | boolean) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function formatScoreKey(key: string) {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export function VerdictReportPage() {
  const { data } = useQuery({ queryKey: ['verdicts'], queryFn: fetchVerdict })

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Verdict report</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{data && serviceTypeLabels[data.service_type]}</p>
                <p className="text-xl font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">{data?.verdict_label}</p>
              </div>
              <div className="flex items-center gap-2">
                {data?.stale && (
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">stale</Badge>
                )}
                {data && <Badge className={verdictLabelClasses[data.verdict_label]}>{data.verdict_label}</Badge>}
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{data?.narrative}</p>
            {data && <p className="mt-3 text-xs text-slate-500">Generated {new Date(data.generated_at).toLocaleString()}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deterministic score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-slate-500">
            The Scoring Engine's structured sub-scores, written before the Judge agent's narrative and label — never a single blended
            number.
          </p>
          <div className="space-y-2">
            {data &&
              Object.entries(data.deterministic_score).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{formatScoreKey(key)}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatScoreValue(value)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
