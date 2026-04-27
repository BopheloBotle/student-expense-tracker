// Dev: use relative URLs so Vite's proxy (see vite.config) forwards /api → backend (no CORS issues).
// Prod / custom: set VITE_API_BASE, e.g. https://api.example.com
const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '' : 'http://localhost:8081')

async function request<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(opts.headers)
  headers.set('Content-Type', 'application/json')
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    let msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : typeof data === 'string' && data
          ? data
          : res.statusText
    if (typeof data === 'object' && data && 'fieldErrors' in data) {
      const fe = (data as { fieldErrors?: Record<string, string> }).fieldErrors
      if (fe && typeof fe === 'object' && Object.keys(fe).length > 0) {
        const detail = Object.entries(fe)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')
        msg = `${msg} (${detail})`
      }
    }
    throw new Error(msg)
  }
  return data as T
}

export type AuthResponse = { accessToken: string; tokenType: string }

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function parseAuthResponse(data: unknown): AuthResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid server response')
  }
  const o = data as Record<string, unknown>
  const raw = o.accessToken ?? o.access_token
  if (typeof raw !== 'string' || !raw) {
    throw new Error('Invalid server response: missing access token')
  }
  const tokenType =
    typeof o.tokenType === 'string'
      ? o.tokenType
      : typeof o.token_type === 'string'
        ? o.token_type
        : 'Bearer'
  return { accessToken: raw, tokenType }
}
export type MeResponse = { id: number; email: string; role: string }
export type BudgetBucket = 'NEEDS' | 'WANTS' | 'SAVINGS_INVESTING' | 'DEBT_GIVING' | 'OTHER'
export type Category = { id: number; name: string; bucket: BudgetBucket }
export type Expense = {
  id: number
  /** API returns JSON numbers; keep string for form state compatibility */
  amount: string | number
  date: string
  categoryId: number | null
  categoryName: string | null
  note: string | null
}

export type DashboardSummary = {
  startDate: string
  endDate: string
  totalSpent: string | number
  byCategory: { category: string; total: string | number }[]
}

export async function apiRegister(email: string, password: string) {
  const data = await request<unknown>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  })
  return parseAuthResponse(data)
}

export async function apiLogin(email: string, password: string) {
  const data = await request<unknown>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  })
  return parseAuthResponse(data)
}

export function apiGetMe(token: string) {
  return request<MeResponse>('/api/users/me', { token })
}

export function apiListCategories(token: string) {
  return request<Category[]>('/api/categories', { token })
}

export function apiCreateCategory(token: string, name: string) {
  return request<Category>('/api/categories', { token, method: 'POST', body: JSON.stringify({ name }) })
}

export function apiDeleteCategory(token: string, id: number) {
  return request<void>(`/api/categories/${id}`, { token, method: 'DELETE' })
}

export function apiUpdateCategoryBucket(token: string, id: number, bucket: BudgetBucket) {
  return request<Category>(`/api/categories/${id}/bucket`, {
    token,
    method: 'PUT',
    body: JSON.stringify({ bucket }),
  })
}

export function apiListExpenses(token: string) {
  return request<Expense[]>('/api/expenses', { token })
}

export function apiCreateExpense(
  token: string,
  payload: { amount: number; date: string; categoryId: number | null; note: string | null },
) {
  return request<Expense>('/api/expenses', { token, method: 'POST', body: JSON.stringify(payload) })
}

export function apiUpdateExpense(
  token: string,
  id: number,
  payload: { amount: number; date: string; categoryId: number | null; note: string | null },
) {
  return request<Expense>(`/api/expenses/${id}`, { token, method: 'PUT', body: JSON.stringify(payload) })
}

export function apiDeleteExpense(token: string, id: number) {
  return request<void>(`/api/expenses/${id}`, { token, method: 'DELETE' })
}

export function apiDashboardSummary(token: string) {
  return request<DashboardSummary>('/api/dashboard/summary', { token })
}

export function apiDashboardSummaryWithRange(
  token: string,
  range?: {
    start?: string
    end?: string
  },
) {
  const params = new URLSearchParams()
  if (range?.start) params.set('start', range.start)
  if (range?.end) params.set('end', range.end)
  const query = params.toString()
  const path = query ? `/api/dashboard/summary?${query}` : '/api/dashboard/summary'
  return request<DashboardSummary>(path, { token })
}

