import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getResource } from '@/config/resources'
import { useResourceList, useResourceMutations } from '@/hooks/api-hooks'
import { useAuthStore } from '@/store/auth'
import { getApiError } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ResourceForm } from './ResourceForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

type Row = Record<string, unknown> & { id: string }

export default function ResourcePage() {
  const { resource } = useParams<{ resource: string }>()
  const config = resource ? getResource(resource) : undefined
  const user = useAuthStore((s) => s.user)

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)

  // Reset view state when switching resources.
  useEffect(() => {
    setPage(1)
    setSearch('')
    setSearchInput('')
    setFormOpen(false)
    setEditing(null)
  }, [resource])

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const params = useMemo(
    () => ({ page, limit: 10, ...(config?.searchable && search ? { search } : {}) }),
    [page, search, config?.searchable],
  )

  const { data, isLoading, isError, error } = useResourceList(config?.path ?? '', params, Boolean(config))
  const { create, update, remove } = useResourceMutations(config?.path ?? '')

  if (!config) {
    return (
      <EmptyState title="Unknown page" message="This resource does not exist." />
    )
  }

  const canWrite =
    !config.readOnly &&
    Boolean(user && (config.writeRoles ?? ['Super Admin', 'School Admin']).includes(user.role))

  const submit = (payload: Record<string, unknown>) => {
    const action = editing
      ? update.mutateAsync({ id: editing.id, body: payload })
      : create.mutateAsync(payload)
    action
      .then(() => {
        toast.success(editing ? `${config.singular} updated` : `${config.singular} created`)
        setFormOpen(false)
        setEditing(null)
      })
      .catch((e) => toast.error(getApiError(e)))
  }

  const confirmDelete = () => {
    if (!deleting) return
    remove
      .mutateAsync(deleting.id)
      .then(() => {
        toast.success(`${config.singular} deleted`)
        setDeleting(null)
      })
      .catch((e) => toast.error(getApiError(e)))
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        actions={
          canWrite ? (
            <button
              className="btn-primary"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              New {config.singular.toLowerCase()}
            </button>
          ) : (
            <span className="badge bg-slate-100 text-slate-500">
              <Lock className="h-3.5 w-3.5" /> Read only
            </span>
          )
        }
      />

      {config.searchable && (
        <div className="mb-4 flex items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder={`Search ${config.title.toLowerCase()}…`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      )}

      {isError ? (
        <div className="card p-8">
          <EmptyState
            title="Couldn't load data"
            message={getApiError(error)}
            icon={<Lock className="h-7 w-7" />}
          />
        </div>
      ) : (
        <>
          <DataTable
            columns={config.columns}
            data={(data?.items as Row[]) ?? []}
            loading={isLoading}
            emptyTitle={`No ${config.title.toLowerCase()} yet`}
            emptyMessage={canWrite ? `Create your first ${config.singular.toLowerCase()} to get started.` : undefined}
            rowActions={
              canWrite
                ? (row) => (
                    <>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                        title="Edit"
                        onClick={() => {
                          setEditing(row)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                        onClick={() => setDeleting(row)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )
                : undefined
            }
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={editing ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
        description={editing ? 'Update the details below.' : `Add a new ${config.singular.toLowerCase()} to the system.`}
        footer={
          <>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setFormOpen(false)}
              disabled={create.isPending || update.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="resource-form"
              className="btn-primary"
              disabled={create.isPending || update.isPending}
            >
              {(create.isPending || update.isPending) && <Spinner className="h-4 w-4" />}
              {editing ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
            </button>
          </>
        }
      >
        {formOpen && <ResourceForm config={config} record={editing} onSubmit={submit} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message="This record will be removed. This action cannot be undone."
      />
    </div>
  )
}
