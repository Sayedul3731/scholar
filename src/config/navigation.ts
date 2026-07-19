import type { Role } from '@/types'
import { RESOURCES } from './resources'

export interface NavGroup {
  label: string
  items: string[]
}

export const NAV_GROUPS: NavGroup[] = [
  { label: 'People', items: ['students', 'teachers', 'parents', 'student-parents', 'staffs', 'users'] },
  {
    label: 'Academics',
    items: [
      'academic-years',
      'sections',
      'classes',
      'subjects',
      'enrollments',
      'routines',
      'teacher-subject-classes',
    ],
  },
  { label: 'Attendance', items: ['attendance', 'teacher-attendance'] },
  { label: 'Examinations', items: ['exams', 'exam-subjects', 'marks', 'results'] },
  { label: 'Assignments', items: ['assignments', 'assignment-submissions'] },
  { label: 'Finance', items: ['fees', 'student-fees', 'payments', 'invoices'] },
  { label: 'Library', items: ['library-books', 'book-issues'] },
  { label: 'Transport', items: ['transport-routes', 'buses'] },
  { label: 'Communication', items: ['notices', 'events', 'notifications', 'documents'] },
  { label: 'Administration', items: ['roles', 'permissions', 'settings', 'audit-logs'] },
]

export function canViewResource(key: string, role: Role): boolean {
  const cfg = RESOURCES[key]
  if (!cfg) return false
  if (!cfg.viewRoles || cfg.viewRoles.length === 0) return true
  return cfg.viewRoles.includes(role)
}

/** Groups filtered to only the resources the given role can view. */
export function visibleNavGroups(role: Role): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((key) => canViewResource(key, role)),
  })).filter((g) => g.items.length > 0)
}
