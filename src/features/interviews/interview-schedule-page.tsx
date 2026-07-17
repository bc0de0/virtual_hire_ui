import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Link2, Video } from 'lucide-react'
import { request } from '../../api/client'
import { interviews, proctoringSession } from '../../api/fixtures'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import type { InterviewStatus } from '../../types'

async function fetchInterviews() {
  return request('interviews', async () =>
    interviews.map((interview) => ({
      interview,
      session: interview.id === proctoringSession.interview_id ? proctoringSession : null,
    })),
  )
}

const interviewStatusClasses: Record<InterviewStatus, string> = {
  scheduled: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
  no_show: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
}

export function InterviewSchedulePage() {
  const { data } = useQuery({ queryKey: ['interviews'], queryFn: fetchInterviews })

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>Schedule interview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays size={16} className="text-indigo-600 dark:text-indigo-400" />
              Assign candidate to a slot
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">09:00 – 09:30</p>
                <p className="text-xs text-slate-500">Open capacity</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">11:15 – 11:45</p>
                <p className="text-xs text-slate-500">1 candidate assigned</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button>Assign slot</Button>
              <Button className="bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Use async review</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video conference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {(data ?? []).map(({ interview, session }) => (
              <div key={interview.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{interview.candidate_name}</p>
                  <Badge className={interviewStatusClasses[interview.status]}>{interview.status.replace('_', ' ')}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Link2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                  {session ? (
                    <span className="truncate">
                      <span className="capitalize">{session.platform.replace('_', ' ')}</span> · {session.external_meeting_ref}
                    </span>
                  ) : (
                    <span className="truncate text-slate-400 dark:text-slate-500">Video platform not yet configured</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[1, 2].map((tile) => (
                    <div key={tile} className="flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-500">
                      <Video size={18} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
