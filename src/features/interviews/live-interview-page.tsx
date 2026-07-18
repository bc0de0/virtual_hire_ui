import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyState } from '../../components/shared/empty-state'

export function LiveInterviewPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
          <CardTitle>Proctoring</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          Per the backend's invariants (docs/04-invariants.md, I15), proctoring analysis is always asynchronous and runs against
          the interview recording after the call ends — it never observes a live session.
        </div>
        <EmptyState
          icon={ShieldCheck}
          title="Not available from the API yet"
          description="Proctoring sessions and detected signals exist in the backend's documented data model but have no implemented routes — there's no way to read a session, its consent state, or its events over the API today. This screen will come online once those endpoints ship."
        />
      </CardContent>
    </Card>
  )
}
