import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api'
import type { PaginatedResult } from '@/types'

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: string | number | undefined
}

type Row = Record<string, unknown> & { id: string }

export function useResourceList(path: string, params: ListParams, enabled = true) {
  return useQuery({
    queryKey: [path, params],
    queryFn: () => apiGet<PaginatedResult<Row>>(path, { params }),
    enabled,
    placeholderData: (prev) => prev,
  })
}

export interface RelationOption {
  value: string
  label: string
}

export function useRelationOptions(
  path: string | undefined,
  label: (item: Record<string, unknown>) => string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['relation', path],
    enabled: Boolean(path) && enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<RelationOption[]> => {
      const res = await apiGet<PaginatedResult<Row>>(path as string, {
        params: { page: 1, limit: 100 },
      })
      return res.items.map((item) => ({ value: item.id, label: label(item) }))
    },
  })
}

export function useResourceMutations(path: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: [path] })

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<Row>(path, body),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<Row>(`${path}/${id}`, body),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`${path}/${id}`),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
