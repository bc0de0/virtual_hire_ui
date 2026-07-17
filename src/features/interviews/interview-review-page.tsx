import { useQuery } from '@tanstack/react-query'
import { AudioLines, PlayCircle } from 'lucide-react'
import { request } from '../../api/client'
import { transcript } from '../../api/fixtures'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import type { TranscriptStatus } from '../../types'

async function fetchReviewData() {
  return request('review', async () => transcript)
}

const transcriptStatusLabels: Record<TranscriptStatus, string> = {
  pending: 'Pending ingestion',
  available: 'Available',
  unavailable: 'Unavailable',
}

const transcriptStatusClasses: Record<TranscriptStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  unavailable: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
}

export function InterviewReviewPage() {
  const { data } = useQuery({ queryKey: ['review'], queryFn: fetchReviewData })
  const paragraphs = data?.text ? data.text.split('\n\n').filter(Boolean) : []

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
              <p className="text-sm">Playback is served from the video platform, not hosted by this app.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex w-full items-center justify-between">
              <CardTitle>Transcript</CardTitle>
              {data && (
                <div className="flex items-center gap-2">
                  {data.source && <span className="text-xs text-slate-500 capitalize">{data.source.replace('_', ' ')}</span>}
                  <Badge className={transcriptStatusClasses[data.status]}>{transcriptStatusLabels[data.status]}</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paragraphs.length > 0 ? (
              <div className="max-h-[330px] space-y-3 overflow-auto pr-2">
                {paragraphs.map((paragraph, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{paragraph}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No transcript text available yet.</p>
            )}
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
