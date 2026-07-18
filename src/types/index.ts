export type Role =
  | 'Super Admin'
  | 'School Admin'
  | 'Teacher'
  | 'Student'
  | 'Parent'
  | 'Accountant'
  | 'Librarian'
  | 'Receptionist'

export interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  data: T
  message?: string | string[]
}

export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RbacPermission {
  id: string
  name: string
}

export interface RbacRole {
  id: string
  name: string
  permissions?: RbacPermission[]
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: Role
  isActive: boolean
  roles?: RbacRole[]
  createdAt: string
  updatedAt: string
}
