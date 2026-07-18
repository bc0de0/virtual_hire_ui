import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { KeyRound, Building2, HeartPulse } from 'lucide-react'
import { api, ApiError, getApiBaseUrl } from '../../api'
import { useAuthStore } from '../../stores/auth-store'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { ErrorNote } from '../../components/shared/error-note'
import type { OrganizationRead } from '../../types'

function maskToken(token: string) {
  if (token.length <= 12) return '•'.repeat(token.length)
  return `${token.slice(0, 6)}…${token.slice(-4)}`
}

export function SettingsPage() {
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const [tokenInput, setTokenInput] = useState(token ?? '')

  const health = useMutation({ mutationFn: () => api.health.check() })

  const [orgName, setOrgName] = useState('')
  const createOrg = useMutation({ mutationFn: () => api.organizations.create({ name: orgName }) })

  const [orgLookupId, setOrgLookupId] = useState('')
  const readOrg = useMutation({ mutationFn: (id: string) => api.organizations.read(id) })

  function renderOrg(org: OrganizationRead) {
    return (
      <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-900 dark:text-slate-100">{org.name}</span>
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">{org.status}</Badge>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">{org.id}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>API connection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Resolved API base URL</Label>
            <p className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              {getApiBaseUrl()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Set via API_BASE_URL (Docker, runtime) or VITE_API_BASE_URL (local build-time). See .env.example.
            </p>
          </div>
          <Button onClick={() => health.mutate()} disabled={health.isPending}>
            {health.isPending ? 'Checking…' : 'Check API health'}
          </Button>
          {health.isSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Connected — status: {health.data.status}
            </div>
          )}
          {health.isError && <ErrorNote message={health.error instanceof ApiError ? health.error.message : 'Could not reach the API.'} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Bearer token</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            The backend verifies externally-issued HR-user JWTs (Auth0/Clerk) — it has no login route of its own yet. Paste a
            token here to authenticate hr-users, requisitions, applications, transcripts, and verdicts requests.
          </p>
          <div>
            <Label htmlFor="token-input">Token</Label>
            <Input
              id="token-input"
              type="password"
              placeholder="eyJhbGciOi..."
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setToken(tokenInput)}>Save token</Button>
            <Button
              className="bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => {
                setToken(null)
                setTokenInput('')
              }}
            >
              Clear
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            {token ? (
              <>
                Currently set: <span className="font-mono">{maskToken(token)}</span>
              </>
            ) : (
              'No token set — authenticated requests will fail with 401.'
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Organization</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs text-slate-500">POST /organizations — unauthenticated, provisions a new tenant.</p>
              <div>
                <Label htmlFor="org-name">Organization name</Label>
                <Input id="org-name" value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Acme Inc." />
              </div>
              <Button onClick={() => createOrg.mutate()} disabled={!orgName || createOrg.isPending}>
                {createOrg.isPending ? 'Creating…' : 'Create organization'}
              </Button>
              {createOrg.isSuccess && renderOrg(createOrg.data)}
              {createOrg.isError && (
                <ErrorNote message={createOrg.error instanceof ApiError ? createOrg.error.message : 'Failed to create organization.'} />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">GET /organizations/{'{id}'} — unauthenticated, fetch by id.</p>
              <div>
                <Label htmlFor="org-lookup">Organization id</Label>
                <Input id="org-lookup" value={orgLookupId} onChange={(event) => setOrgLookupId(event.target.value)} placeholder="uuid" />
              </div>
              <Button onClick={() => readOrg.mutate(orgLookupId)} disabled={!orgLookupId || readOrg.isPending}>
                {readOrg.isPending ? 'Looking up…' : 'Look up organization'}
              </Button>
              {readOrg.isSuccess && renderOrg(readOrg.data)}
              {readOrg.isError && (
                <ErrorNote message={readOrg.error instanceof ApiError ? readOrg.error.message : 'Failed to fetch organization.'} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
