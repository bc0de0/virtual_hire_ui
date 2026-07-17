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
