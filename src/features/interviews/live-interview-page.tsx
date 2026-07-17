import { useQuery } from '@tanstack/react-query'
import { Camera, Mic, Monitor, VideoOff } from 'lucide-react'
import { request } from '../../api/client'
import { proctorEvents, transcriptSegments } from '../../api/fixtures'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

async function fetchLiveData() {
  return request('live', async () => ({
    flags: proctorEvents,
    transcript: transcriptSegments,
  }))
}

export function LiveInterviewPage() {
  const { data } = useQuery({ queryKey: ['live'], queryFn: fetchLiveData })

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Proctor view</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                Recording
              </div>
              <div className="flex items-center gap-2">
                <Camera size={16} />
                <Mic size={16} />
                <Monitor size={16} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2].map((tile) => (
                <div key={tile} className="flex h-36 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-500">
                  {tile === 1 ? <VideoOff size={22} /> : <Camera size={22} />}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.flags ?? []).map((flag) => (
            <div key={flag.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900 dark:text-slate-100">{flag.label}</p>
                <Badge
                  className={
                    flag.severity === 'critical'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                      : flag.severity === 'warning'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'
                  }
                >
                  {flag.severity}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{flag.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
