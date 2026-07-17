import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { request } from '../../api/client'
import { verdicts } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

async function fetchVerdict() {
  return request('verdicts', async () => verdicts[0])
}

export function VerdictReportPage() {
  const { data } = useQuery({ queryKey: ['verdicts'], queryFn: fetchVerdict })

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>AI verdict report</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Recommendation</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{data?.recommendation}</p>
              </div>
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">{Math.round((data?.confidence ?? 0) * 100)}% confidence</Badge>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{data?.summary}</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Strengths</p>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                {data?.strengths.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-300">Gaps</p>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                {data?.gaps.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.citations ?? []).map((citation) => (
            <div key={citation.timestamp} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>Transcript</span>
                <span>{citation.timestamp}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">"{citation.quote}"</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
