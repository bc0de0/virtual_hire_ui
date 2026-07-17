import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDashed, ShieldCheck, Video } from 'lucide-react'
import { request } from '../../api/client'
import { proctoringEvents, proctoringSession } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import type { ProctoringEventType, ProctoringSessionStatus, ProctoringSeverity } from '../../types'

async function fetchProctoringData() {
  return request('proctoring', async () => ({
    session: proctoringSession,
    events: proctoringEvents,
  }))
}

const eventTypeLabels: Record<ProctoringEventType, string> = {
  multiple_faces_detected: 'Multiple faces detected',
  face_not_detected: 'Face not detected',
  gaze_away: 'Gaze drifted away',
  voice_mismatch: 'Voice mismatch',
  background_voice_detected: 'Background voice detected',
  other: 'Other signal',
}

const severityClasses: Record<ProctoringSeverity, string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
}

const sessionStatusLabels: Record<ProctoringSessionStatus, string> = {
  not_configured: 'Not configured',
  consent_pending: 'Awaiting consent',
  active: 'Call in progress',
  analyzing: 'Analyzing recording',
  completed: 'Analysis complete',
  failed: 'Analysis failed',
}

export function LiveInterviewPage() {
  const { data } = useQuery({ queryKey: ['proctoring'], queryFn: fetchProctoringData })
  const session = data?.session

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Proctoring session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Proctoring analysis always runs asynchronously against the interview recording after the call ends — it never
            observes or intervenes in a live session.
          </div>

          {session && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Video size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="capitalize">{session.platform.replace('_', ' ')}</span>
                  {session.external_meeting_ref && <span className="text-slate-400">· {session.external_meeting_ref}</span>}
                </div>
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {sessionStatusLabels[session.status]}
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  {session.candidate_consented_at ? (
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CircleDashed size={16} className="text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Candidate consent</p>
                    <p className="text-xs text-slate-500">{session.candidate_consented_at ? new Date(session.candidate_consented_at).toLocaleString() : 'Not yet given'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  {session.interviewer_consented_at ? (
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CircleDashed size={16} className="text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Interviewer consent</p>
                    <p className="text-xs text-slate-500">{session.interviewer_consented_at ? new Date(session.interviewer_consented_at).toLocaleString() : 'Not yet given'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} />
                Signal ingestion is rejected until both consents are recorded.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detected signals</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.events ?? []).map((event) => (
            <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900 dark:text-slate-100">{eventTypeLabels[event.event_type]}</p>
                <Badge className={severityClasses[event.severity]}>{event.severity}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(event.detected_at).toLocaleTimeString()}
                {event.confidence !== null && ` · ${Math.round(event.confidence * 100)}% confidence`}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
