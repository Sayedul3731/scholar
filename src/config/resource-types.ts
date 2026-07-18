import type { ReactNode } from 'react'
import type { Role } from '@/types'

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select'
  | 'relation'
  | 'multi-relation'
  | 'checkbox'

export interface RelationSource {
  /** API path to fetch options from, e.g. '/subjects'. */
  path: string
  /** Build a readable label for an option. */
  label: (item: Record<string, unknown>) => string
}

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: { label: string; value: string }[]
  relation?: RelationSource
  min?: number
  step?: number
  /** Nest this field under a parent object key in the payload (e.g. 'user'). */
  group?: string
  /** Hide the field when editing an existing record. */
  hideOnEdit?: boolean
  /** Field spans both columns of the form grid. */
  full?: boolean
  defaultValue?: string | number | boolean
}

export interface ResourceColumn<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
}

export interface ResourceConfig<T = Record<string, unknown>> {
  key: string
  path: string
  title: string
  singular: string
  subtitle?: string
  icon: ReactNode
  /** Roles allowed to view this resource. Empty/undefined = all authenticated. */
  viewRoles?: Role[]
  /** Roles allowed to create/edit/delete. Undefined falls back to admins. */
  writeRoles?: Role[]
  searchable?: boolean
  readOnly?: boolean
  columns: ResourceColumn<T>[]
  fields: FieldConfig[]
}
