import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiEnvelope, AuthTokens } from '@/types'

const ACCESS_KEY = 'sms_access_token'
const REFRESH_KEY = 'sms_refresh_token'

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`
  const value = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length)

  return value ? decodeURIComponent(value) : null
}

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`
}

function removeCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`
}

export const tokenStore = {
  get access() {
    return getCookie(ACCESS_KEY)
  },
  get refresh() {
    return getCookie(REFRESH_KEY)
  },
  set(tokens: AuthTokens) {
    setCookie(ACCESS_KEY, tokens.accessToken)
    setCookie(REFRESH_KEY, tokens.refreshToken)
  },
  clear() {
    removeCookie(ACCESS_KEY)
    removeCookie(REFRESH_KEY)
  },
}

export const API_BASE = '/api/v1'

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.refresh
  if (!refreshToken) return null
  try {
    const { data } = await axios.post<ApiEnvelope<AuthTokens>>(`${API_BASE}/auth/refresh`, {
      refreshToken,
    })
    tokenStore.set(data.data)
    return data.data.accessToken
  } catch {
    tokenStore.clear()
    return null
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const isAuthCall = original?.url?.includes('/auth/')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      refreshing = refreshing ?? performRefresh()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
        return http(original)
      }
      // Refresh failed — force logout.
      tokenStore.clear()
      window.dispatchEvent(new Event('sms:session-expired'))
    }
    return Promise.reject(error)
  },
)

/** Unwrap the standard success envelope and return the payload. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.get<ApiEnvelope<T>>(url, config)
  return data.data
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.post<ApiEnvelope<T>>(url, body, config)
  return data.data
}

/** Send a POST request that intentionally returns no response body. */
export async function apiPostVoid(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<void> {
  await http.post(url, body, config)
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.patch<ApiEnvelope<T>>(url, body)
  return data.data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.put<ApiEnvelope<T>>(url, body)
  return data.data
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const { data } = await http.delete<ApiEnvelope<T>>(url)
  return data.data
}

/** Extract a human-readable message from an API error. */
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string | string[] } | undefined
    const msg = payload?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string') return msg
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the API running?'
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
