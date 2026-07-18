import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyState } from '../../components/shared/empty-state'

export function InterviewSchedulePage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-indigo-600 dark:text-indigo-400" />
          <CardTitle>Schedule interview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={CalendarClock}
          title="Not available from the API yet"
          description="The backend has no route to create, list, or schedule interviews (there's no /interviews collection endpoint at all — only POST /interviews/{interview_id}/transcript against an id that already exists elsewhere). This screen will come online once interview-creation ships on the backend."
        />
      </CardContent>
    </Card>
  )
}
