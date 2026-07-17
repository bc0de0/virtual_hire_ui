// Mock request layer. The virtual_hire backend (bc0de0/virtual_hire) has no
// implemented routes yet beyond /health, so this simulates network latency
// over local fixtures instead of calling out. The fixtures and src/types
// mirror that backend's documented schema (docs/05-data-model.md) field-for-
// field, so swapping fn() below for a real fetch() later shouldn't require
// touching the types or the page components that consume them.
const API_DELAY_MS = 400

async function delay(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function request<T>(
  _key: string,
  fn: () => Promise<T>,
): Promise<T> {
  await delay(API_DELAY_MS)
  return fn()
}

export const mockApi = {
  enabled: true,
  baseUrl: '/mock-api',
}
