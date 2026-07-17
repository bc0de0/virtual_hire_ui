import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Clock3, Users } from 'lucide-react'
import { request } from '../../api/client'
import { candidates, interviews } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import type { Candidate } from '../../types'

async function fetchDashboardData() {
  return request('dashboard', async () => ({
    candidates,
    interviews,
  }))
}

function stageLabel(stage: Candidate['stage']) {
  switch (stage) {
    case 'screening':
      return 'Screening'
    case 'assessment':
      return 'Assessment'
    case 'interview':
      return 'Interview'
    default:
      return 'Decision'
  }
}

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboardData })

  const items = data?.candidates ?? []
  const interviewsList = data?.interviews ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Interviews today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Clock3 size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-3xl font-semibold">{interviewsList.filter((item) => item.status === 'In Progress').length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending verdicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
              <span className="text-3xl font-semibold">2</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-3xl font-semibold">{items.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{candidate.name}</p>
                    <p className="text-xs text-slate-500">{candidate.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300">{stageLabel(candidate.stage)}</Badge>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{candidate.score}/100</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {interviewsList.map((interview) => (
              <div key={interview.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{interview.candidateName}</p>
                  <Badge className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">{interview.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{new Date(interview.scheduledAt).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
