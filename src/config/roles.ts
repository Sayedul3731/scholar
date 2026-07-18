import type { Role } from '@/types'

export const ALL_ROLES: Role[] = [
  'Super Admin',
  'School Admin',
  'Teacher',
  'Student',
  'Parent',
  'Accountant',
  'Librarian',
  'Receptionist',
]

export const ADMIN_ROLES: Role[] = ['Super Admin', 'School Admin']
export const STAFF_ROLES: Role[] = [
  'Super Admin',
  'School Admin',
  'Accountant',
  'Librarian',
  'Receptionist',
]

export function roleTone(role: Role): 'brand' | 'green' | 'amber' | 'blue' | 'purple' | 'pink' | 'slate' {
  switch (role) {
    case 'Super Admin':
      return 'purple'
    case 'School Admin':
      return 'brand'
    case 'Teacher':
      return 'blue'
    case 'Student':
      return 'green'
    case 'Parent':
      return 'amber'
    default:
      return 'slate'
  }
}
