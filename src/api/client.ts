// Thin fetch wrapper over the live Sift API (see src/types/index.ts for the
// schema this targets). No mock layer, no fixtures - every call here hits a
// real backend over the network.
import { useAuthStore } from '../stores/auth-store'

const DEFAULT_API_BASE_URL = 'http://10.10.24.196:8000'

// Resolution order: runtime config (docker/entrypoint.sh regenerates
// public/env-config.js from API_BASE_URL at container start, so this wins
// with no rebuild) -> build-time Vite env -> hardcoded fallback.
export function getApiBaseUrl(): string {
  const runtime = window.__APP_CONFIG__?.apiBaseUrl
  if (runtime) return runtime.replace(/\/$/, '')
  const buildTime = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (buildTime) return buildTime.replace(/\/$/, '')
  return DEFAULT_API_BASE_URL
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// FastAPI's default error shape is {"detail": string | ValidationError[]}.
function extractErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((entry) => (entry && typeof entry === 'object' && 'msg' in entry ? String((entry as { msg: unknown }).msg) : JSON.stringify(entry)))
        .join('; ')
    }
  }
  return `Request failed with status ${status}`
}

interface RequestOptions {
  method?: string
  json?: unknown
  form?: FormData
  signal?: AbortSignal
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  const token = useAuthStore.getState().token
  if (token) headers.Authorization = `Bearer ${token}`

  let body: BodyInit | undefined
  if (options.form) {
    body = options.form
    // Deliberately no Content-Type - the browser sets multipart/form-data
    // with the correct boundary itself, which fetch can't reproduce if we
    // set it manually.
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.json)
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
    signal: options.signal,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(res.status, data), data)
  }

  return data as T
}

export { apiFetch }
