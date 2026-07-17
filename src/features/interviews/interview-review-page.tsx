import { useQuery } from '@tanstack/react-query'
import { AudioLines, PlayCircle } from 'lucide-react'
import { request } from '../../api/client'
import { transcriptSegments } from '../../api/fixtures'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

async function fetchReviewData() {
  return request('review', async () => ({ transcript: transcriptSegments }))
}

export function InterviewReviewPage() {
  const { data } = useQuery({ queryKey: ['review'], queryFn: fetchReviewData })

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Video playback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <div className="text-center">
              <PlayCircle size={34} className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
              <p className="font-medium text-slate-900 dark:text-slate-100">Stub player</p>
              <p className="text-sm">Future integration point for video SDK.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[330px] space-y-3 overflow-auto pr-2">
              {(data?.transcript ?? []).map((segment) => (
                <div key={segment.id} className="rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{segment.speaker}</span>
                    <span>{segment.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{segment.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audio waveform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 p-4">
              {[36, 56, 44, 70, 40, 58, 64].map((height, index) => (
                <div key={index} className="flex-1 rounded-full bg-indigo-500/70" style={{ height: `${height}px` }} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <AudioLines size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Waveform placeholder for future audio analysis.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
