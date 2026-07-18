import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AudioLines, FileText } from 'lucide-react'
import { api, ApiError } from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { ErrorNote } from '../../components/shared/error-note'
import type { TranscriptStatus } from '../../types'

const transcriptStatusClasses: Record<TranscriptStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  unavailable: 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
}

export function InterviewReviewPage() {
  const [interviewId, setInterviewId] = useState('')
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('en')
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const ingest = useMutation({
    mutationFn: () =>
      api.transcripts.ingest({
        interview_id: interviewId,
        text: text || null,
        language: language || null,
        audio_file: audioFile,
      }),
  })

  const canSubmit = Boolean(interviewId && (text || audioFile))

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Ingest transcript</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            POST /interviews/{'{interview_id}'}/transcript accepts platform-provided text or an audio file for STT, then queues
            embedding — requires a bearer token (see Settings). There's no GET endpoint to re-fetch a transcript later, so this
            page only shows the response from the ingestion call itself.
          </p>
          <div>
            <Label htmlFor="interview-id">Interview id</Label>
            <Input id="interview-id" value={interviewId} onChange={(event) => setInterviewId(event.target.value)} placeholder="uuid" />
          </div>
          <div>
            <Label htmlFor="transcript-text">Transcript text (platform-provided)</Label>
            <Textarea
              id="transcript-text"
              rows={6}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Interviewer: ...\nCandidate: ..."
            />
          </div>
          <div>
            <Label htmlFor="transcript-language">Language (optional)</Label>
            <Input id="transcript-language" value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="en" />
          </div>
          <div>
            <Label htmlFor="audio-file">Or upload an audio recording for STT</Label>
            <input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 dark:text-slate-400 dark:file:bg-indigo-500/10 dark:file:text-indigo-300"
            />
          </div>
          <Button onClick={() => ingest.mutate()} disabled={!canSubmit || ingest.isPending}>
            {ingest.isPending ? 'Ingesting…' : 'Ingest transcript'}
          </Button>
          {ingest.isError && (
            <ErrorNote message={ingest.error instanceof ApiError ? ingest.error.message : 'Failed to ingest transcript.'} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AudioLines size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Ingestion result</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {ingest.isSuccess ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-xs text-slate-500">{ingest.data.id}</p>
                <Badge className={transcriptStatusClasses[ingest.data.status]}>{ingest.data.status}</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Interview {ingest.data.interview_id}</p>
              {ingest.data.source && <p className="mt-1 text-xs text-slate-500 capitalize">{ingest.data.source.replace('_', ' ')}</p>}
              {ingest.data.language && <p className="text-xs text-slate-500">Language: {ingest.data.language}</p>}
              <p className="mt-2 text-xs text-slate-500">Updated {new Date(ingest.data.updated_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Submit a transcript to see the server's response here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
