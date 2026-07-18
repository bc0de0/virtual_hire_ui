import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/shared/app-shell'
import { DashboardPage } from '../features/dashboard/dashboard-page'
import { CandidateUploadPage } from '../features/candidates/candidate-upload-page'
import { InterviewSchedulePage, LiveInterviewPage, InterviewReviewPage } from '../features/interviews'
import { VerdictReportPage } from '../features/verdicts/verdict-report-page'
import { SettingsPage } from '../features/settings/settings-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'candidates/upload', element: <CandidateUploadPage /> },
      { path: 'interviews/schedule', element: <InterviewSchedulePage /> },
      { path: 'interviews/live', element: <LiveInterviewPage /> },
      { path: 'interviews/review', element: <InterviewReviewPage /> },
      { path: 'verdicts/report', element: <VerdictReportPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
