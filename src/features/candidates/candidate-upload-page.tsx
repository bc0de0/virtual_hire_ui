import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, LoaderCircle, UploadCloud } from 'lucide-react'
import { request } from '../../api/client'
import { candidates } from '../../api/fixtures'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

async function fetchCandidates() {
  return request('candidates', async () => candidates)
}

export function CandidateUploadPage() {
  const { data } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const [uploading, setUploading] = useState(false)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
            <UploadCloud size={28} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
            <p className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Drop a resume or browse to upload</p>
            <p className="mb-4 text-sm text-slate-500">PDF resumes are ingested into the mock RAG pipeline and shown as pending processing.</p>
            <Button onClick={() => setUploading(true)}>Upload resume</Button>
          </div>
          {uploading && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
              <LoaderCircle className="animate-spin" size={16} />
              Processing and ingesting candidate document into the mock retrieval pipeline.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion queue</CardTitle>
        </CardHeader>
        <CardContent>
          {(data ?? []).map((candidate) => (
            <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{candidate.name}</p>
                  <p className="text-xs text-slate-500">{candidate.role}</p>
                </div>
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">Ready</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <FileText size={14} />
                <span>{candidate.resumeUrl}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
