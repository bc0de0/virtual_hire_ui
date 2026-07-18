import { useQuery } from '@tanstack/react-query'
import { HeartPulse, Users, CalendarClock } from 'lucide-react'
import { api } from '../../api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyState } from '../../components/shared/empty-state'

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health.check(),
    retry: false,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>API status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {healthQuery.isPending && <p className="text-sm text-slate-500">Checking connection…</p>}
          {healthQuery.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Connected to the Sift API — status: {healthQuery.data.status}
            </div>
          )}
          {healthQuery.isError && (
            <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Could not reach the API. Check the base URL in Settings.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Candidate pipeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Users}
              title="No list-candidates endpoint yet"
              description="The API supports submitting an application (Upload page) and reading a single verdict, but there's no route to list candidates or applications. This view will populate once that endpoint ships."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock size={18} className="text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Interview schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarClock}
              title="No interview endpoints yet"
              description="The API can ingest a transcript for an existing interview_id, but has no route to create, list, or schedule interviews. This view will populate once those endpoints ship."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
