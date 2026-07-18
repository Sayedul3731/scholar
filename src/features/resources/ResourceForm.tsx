import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FieldConfig, ResourceConfig } from '@/config/resource-types'
import { RelationSelect, MultiRelationSelect } from '@/components/form/RelationSelect'
import { cn } from '@/lib/utils'

type Values = Record<string, unknown>

function initialValue(field: FieldConfig, record: Values | null): unknown {
  if (!record) return field.type === 'multi-relation' ? [] : field.type === 'checkbox' ? false : ''
  if (field.type === 'multi-relation') {
    const direct = record[field.name]
    if (Array.isArray(direct)) return direct
    // Derive from nested relation array, e.g. subjectIds <- subjects[].id
    const nestedKey = field.name.replace(/Ids$/, 's')
    const nested = record[nestedKey]
    if (Array.isArray(nested)) return nested.map((x) => (x as { id: string }).id)
    return []
  }
  const raw = record[field.name]
  if (raw !== undefined && raw !== null) {
    if (field.type === 'date' && typeof raw === 'string') return raw.slice(0, 10)
    return raw
  }
  if (field.type === 'relation') {
    const nested = record[field.name.replace(/Id$/, '')] as { id?: string } | undefined
    if (nested?.id) return nested.id
  }
  return field.type === 'checkbox' ? false : ''
}

export function ResourceForm({
  config,
  record,
  onSubmit,
}: {
  config: ResourceConfig
  record: Values | null
  onSubmit: (payload: Values) => void
}) {
  const isEdit = Boolean(record)
  const fields = useMemo(
    () => config.fields.filter((f) => !(isEdit && f.hideOnEdit)),
    [config.fields, isEdit],
  )

  const [values, setValues] = useState<Values>(() => {
    const v: Values = {}
    for (const f of fields) v[f.name] = initialValue(f, record)
    return v
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (name: string, value: unknown) => setValues((p) => ({ ...p, [name]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    for (const f of fields) {
      if (!f.required) continue
      const v = values[f.name]
      const empty = v === '' || v === undefined || v === null || (Array.isArray(v) && v.length === 0)
      if (empty) errs[f.name] = `${f.label} is required`
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const payload: Values = {}
    for (const f of fields) {
      let v = values[f.name]
      if (v === '' || v === undefined || v === null) {
        if (!f.required) continue
      }
      if (f.type === 'number' && v !== '' && v !== undefined) v = Number(v)
      const target = f.group ? ((payload[f.group] ??= {}) as Values) : payload
      target[f.name] = v
    }
    onSubmit(payload)
  }

  const groups = useMemo(() => {
    const map = new Map<string, FieldConfig[]>()
    for (const f of fields) {
      const key = f.group ?? '__root__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(f)
    }
    return [...map.entries()]
  }, [fields])

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="resource-form">
      {groups.map(([group, groupFields]) => (
        <div key={group}>
          {group !== '__root__' && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group === 'user' ? 'Account details' : group}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groupFields.map((f) => (
              <Field
                key={f.name}
                field={f}
                value={values[f.name]}
                error={errors[f.name]}
                onChange={(v) => set(f.name, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </form>
  )
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldConfig
  value: unknown
  error?: string
  onChange: (v: unknown) => void
}) {
  const full = field.full || field.type === 'textarea' || field.type === 'multi-relation'

  return (
    <div className={cn(full && 'sm:col-span-2')}>
      {field.type !== 'checkbox' && (
        <label className="label">
          {field.label}
          {field.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      {field.type === 'textarea' ? (
        <textarea
          className="input min-h-[90px] resize-y"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' ? (
        <div className="relative">
          <select
            className="input appearance-none pr-9"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select…</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      ) : field.type === 'relation' && field.relation ? (
        <RelationSelect
          source={field.relation}
          value={String(value ?? '')}
          onChange={onChange}
        />
      ) : field.type === 'multi-relation' && field.relation ? (
        <MultiRelationSelect
          source={field.relation}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      ) : field.type === 'checkbox' ? (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
        </label>
      ) : (
        <input
          className="input"
          type={field.type}
          placeholder={field.placeholder}
          min={field.min}
          step={field.step}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.helpText && !error && <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
