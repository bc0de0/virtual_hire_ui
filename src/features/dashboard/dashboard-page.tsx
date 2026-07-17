import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Clock3, Users } from 'lucide-react'
import { request } from '../../api/client'
import { candidates, interviews } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import type { ApplicationStatus, InterviewStatus, VerdictLabel } from '../../types'

async function fetchDashboardData() {
  return request('dashboard', async () => ({
    candidates,
    interviews,
  }))
}

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const applicationStatusClasses: Record<ApplicationStatus, string> = {
  submitted: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  screening: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  interviewing: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300',
  offer: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  hired: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  withdrawn: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
}

const verdictLabelClasses: Record<VerdictLabel, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  review: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  fail: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

const interviewStatusClasses: Record<InterviewStatus, string> = {
  scheduled: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
  no_show: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboardData })

  const items = data?.candidates ?? []
  const interviewsList = data?.interviews ?? []
  const pendingVerdicts = items.filter((candidate) => candidate.latest_verdict_label === null).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Interviews scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Clock3 size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-3xl font-semibold">{interviewsList.filter((item) => item.status === 'scheduled').length}</span>
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
              <span className="text-3xl font-semibold">{pendingVerdicts}</span>
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
                    <p className="font-medium text-slate-900 dark:text-slate-100">{candidate.full_name}</p>
                    <p className="text-xs text-slate-500">{candidate.role_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={applicationStatusClasses[candidate.application_status]}>{applicationStatusLabels[candidate.application_status]}</Badge>
                    {candidate.latest_verdict_label ? (
                      <Badge className={verdictLabelClasses[candidate.latest_verdict_label]}>{candidate.latest_verdict_label}</Badge>
                    ) : (
                      <Badge className="border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">no verdict</Badge>
                    )}
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
                  <p className="font-medium text-slate-900 dark:text-slate-100">{interview.candidate_name}</p>
                  <Badge className={interviewStatusClasses[interview.status]}>{interview.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{new Date(interview.scheduled_at).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
