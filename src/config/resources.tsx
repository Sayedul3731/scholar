import {
  GraduationCap,
  Users,
  UserCog,
  Contact,
  Briefcase,
  CalendarRange,
  Layers,
  DoorOpen,
  BookOpen,
  ClipboardList,
  CalendarClock,
  Link2,
  CheckSquare,
  UserCheck,
  FileText,
  ListChecks,
  PenSquare,
  Award,
} from 'lucide-react'
import {
  Banknote,
  ReceiptText,
  CreditCard,
  FileSpreadsheet,
  Megaphone,
  CalendarHeart,
  Library,
  BookMarked,
  Bus,
  Route,
  Bell,
  ShieldCheck,
  KeyRound,
  Settings2,
  ScrollText,
  Files,
} from 'lucide-react'
import type { ResourceConfig } from './resource-types'
import { ADMIN_ROLES, STAFF_ROLES } from './roles'
import { Badge, statusTone } from '@/components/ui/Badge'
import { formatDate, formatMoney, fullName, titleCase } from '@/lib/utils'

/** Safe nested getter. */
function get(row: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[k]
    return undefined
  }, row)
}

const rec = (v: unknown) => (v ?? {}) as Record<string, unknown>

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const STUDENT_PARENT_RELATION_OPTIONS = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Other', value: 'other' },
]

const DAY_OPTIONS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
].map((d) => ({ label: titleCase(d), value: d }))

const ATTENDANCE_OPTIONS = ['present', 'absent', 'late', 'excused'].map((s) => ({
  label: titleCase(s),
  value: s,
}))

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'mobile', 'cheque'].map((s) => ({
  label: titleCase(s),
  value: s,
}))

const PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'].map((s) => ({
  label: titleCase(s),
  value: s,
}))

const ROLE_OPTIONS = [
  'Super Admin',
  'School Admin',
  'Teacher',
  'Student',
  'Parent',
  'Accountant',
  'Librarian',
  'Receptionist',
].map((r) => ({ label: r, value: r }))

// ---- Relation label helpers ----
const studentLabel = (i: Record<string, unknown>) =>
  i.user ? `${fullName(rec(i.user))} · ${i.admissionNumber ?? ''}`.trim() : String(i.admissionNumber ?? i.id)
const parentLabel = (i: Record<string, unknown>) =>
  i.user ? fullName(rec(i.user)) : String(i.id)
const guardianName = (student: Record<string, unknown>) => {
  const relationships = Array.isArray(student.studentParents) ? student.studentParents : []
  const guardian =
    relationships.find(
        (relationship) =>
          rec(relationship).relation === 'guardian' && rec(relationship).parent,
      ) ?? relationships.find((relationship) => rec(relationship).parent)
  return guardian
    ? fullName(rec(rec(guardian).parent).user as { firstName?: string; lastName?: string })
    : '—'
}
const teacherLabel = (i: Record<string, unknown>) =>
  i.user ? `${fullName(rec(i.user))} · ${i.employeeId ?? ''}`.trim() : String(i.employeeId ?? i.id)
const userLabel = (i: Record<string, unknown>) =>
  `${fullName(i)}${i.email ? ` · ${i.email}` : ''}`
const nameLabel = (i: Record<string, unknown>) => String(i.name ?? i.title ?? i.id)
const subjectLabel = (i: Record<string, unknown>) =>
  `${i.name ?? ''}${i.code ? ` (${i.code})` : ''}` || String(i.id)
const examLabel = (i: Record<string, unknown>) =>
  `${i.name ?? ''}${i.term ? ` · ${i.term}` : ''}` || String(i.id)
const classroomLabel = (i: Record<string, unknown>) => {
  const cls = rec(i.class).name ?? rec(rec(i.classEntity)).name
  const sec = rec(i.section).name
  if (cls || sec) return `${cls ?? 'Class'} ${sec ?? ''}`.trim()
  return `Classroom ${String(i.id).slice(0, 8)}`
}
const feeLabel = (i: Record<string, unknown>) => `${i.name ?? 'Fee'} · ${formatMoney(Number(i.amount))}`

const nameCol = { key: 'name', header: 'Name', render: (r: Record<string, unknown>) => String(r.name ?? '—') }
const createdCol = {
  key: 'createdAt',
  header: 'Created',
  render: (r: Record<string, unknown>) => formatDate(r.createdAt as string),
}

function personColumns() {
  return [
    {
      key: 'name',
      header: 'Name',
      render: (r: Record<string, unknown>) => {
        const user = rec(r.user)
        return (
          <div>
            <p className="font-semibold text-slate-800">{fullName(user)}</p>
            <p className="text-xs text-slate-400">{String(user.phone ?? user.email ?? '')}</p>
          </div>
        )
      },
    },
  ]
}

const userGroupFields = () => [
  { name: 'firstName', label: 'First name', type: 'text' as const, required: true, group: 'user', hideOnEdit: true },
  { name: 'lastName', label: 'Last name', type: 'text' as const, required: true, group: 'user', hideOnEdit: true },
  { name: 'email', label: 'Email', type: 'email' as const, group: 'user', hideOnEdit: true, helpText: 'Provide an email or a phone number' },
  { name: 'phone', label: 'Phone', type: 'text' as const, group: 'user', hideOnEdit: true, helpText: 'Provide a phone number or an email' },
  { name: 'password', label: 'Password', type: 'password' as const, required: true, group: 'user', hideOnEdit: true, helpText: 'Minimum 8 characters' },
]

export const RESOURCES: Record<string, ResourceConfig> = {
  // ---------------- People ----------------
  students: {
    key: 'students',
    path: '/students',
    title: 'Students',
    singular: 'Student',
    subtitle: 'Enrolled learners and their profiles',
    icon: <GraduationCap className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      ...personColumns(),
      { key: 'admissionNumber', header: 'Admission #', render: (r) => String(r.admissionNumber ?? '—') },
      { key: 'gender', header: 'Gender', render: (r) => titleCase(r.gender as string) },
      { key: 'guardianName', header: 'Guardian', render: guardianName },
      { key: 'dateOfBirth', header: 'Date of birth', render: (r) => formatDate(r.dateOfBirth as string) },
    ],
    requireOneOf: [['email', 'phone']],
    passwordReset: { userId: (r) => rec(r.user).id as string | undefined },
    fields: [
      ...userGroupFields(),
      { name: 'admissionNumber', label: 'Admission number', type: 'text', required: true },
      { name: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDER_OPTIONS },
      { name: 'classRoomId', label: 'Classroom', type: 'relation', relation: { path: '/classes', label: classroomLabel } },
      { name: 'address', label: 'Address', type: 'textarea', full: true },
    ],
  },

  teachers: {
    key: 'teachers',
    path: '/teachers',
    title: 'Teachers',
    singular: 'Teacher',
    subtitle: 'Faculty members and their subjects',
    icon: <UserCog className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      ...personColumns(),
      { key: 'employeeId', header: 'Employee ID', render: (r) => String(r.employeeId ?? '—') },
      { key: 'qualification', header: 'Qualification', render: (r) => String(r.qualification ?? '—') },
      { key: 'joiningDate', header: 'Joined', render: (r) => formatDate(r.joiningDate as string) },
    ],
    requireOneOf: [['email', 'phone']],
    passwordReset: { userId: (r) => rec(r.user).id as string | undefined },
    fields: [
      ...userGroupFields(),
      { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
      { name: 'qualification', label: 'Qualification', type: 'text' },
      { name: 'joiningDate', label: 'Joining date', type: 'date' },
      { name: 'subjectIds', label: 'Subjects', type: 'multi-relation', relation: { path: '/subjects', label: subjectLabel }, full: true },
    ],
  },

  parents: {
    key: 'parents',
    path: '/parents',
    title: 'Parents',
    singular: 'Parent',
    subtitle: 'Parent and guardian accounts',
    icon: <Contact className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      ...personColumns(),
      { key: 'occupation', header: 'Occupation', render: (r) => String(r.occupation ?? '—') },
      createdCol,
    ],
    requireOneOf: [['email', 'phone']],
    passwordReset: { userId: (r) => rec(r.user).id as string | undefined },
    fields: [
      ...userGroupFields(),
      { name: 'occupation', label: 'Occupation', type: 'text' },
    ],
  },

  'student-parents': {
    key: 'student-parents',
    path: '/student-parents',
    title: 'Student Parents',
    singular: 'Student-parent relationship',
    subtitle: 'Links between students and their parents or guardians',
    icon: <Link2 className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'parent', header: 'Parent', render: (r) => parentLabel(rec(r.parent)) },
      { key: 'relation', header: 'Relationship', render: (r) => titleCase(r.relation as string) },
      createdCol,
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'parentId', label: 'Parent', type: 'relation', required: true, relation: { path: '/parents', label: parentLabel } },
      { name: 'relation', label: 'Relationship', type: 'select', required: true, options: STUDENT_PARENT_RELATION_OPTIONS },
    ],
  },

  staffs: {
    key: 'staffs',
    path: '/staffs',
    title: 'Staff',
    singular: 'Staff member',
    subtitle: 'Non-teaching personnel',
    icon: <Briefcase className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      ...personColumns(),
      { key: 'department', header: 'Department', render: (r) => String(r.department ?? '—') },
      createdCol,
    ],
    requireOneOf: [['email', 'phone']],
    passwordReset: { userId: (r) => rec(r.user).id as string | undefined },
    fields: [
      ...userGroupFields(),
      { name: 'department', label: 'Department', type: 'text' },
    ],
  },

  users: {
    key: 'users',
    path: '/users',
    title: 'Users',
    singular: 'User',
    subtitle: 'System accounts and access',
    icon: <Users className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    passwordReset: {},
    columns: [
      {
        key: 'name',
        header: 'Name',
        render: (r) => (
          <div>
            <p className="font-semibold text-slate-800">{fullName(r)}</p>
            <p className="text-xs text-slate-400">{String(r.email ?? r.phone ?? '')}</p>
          </div>
        ),
      },
      { key: 'role', header: 'Role', render: (r) => <Badge tone="brand">{String(r.role ?? '—')}</Badge> },
      { key: 'phone', header: 'Phone', render: (r) => String(r.phone ?? '—') },
      {
        key: 'isActive',
        header: 'Status',
        render: (r) => (
          <Badge tone={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
        ),
      },
    ],
    requireOneOf: [['email', 'phone']],
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true },
      { name: 'lastName', label: 'Last name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', helpText: 'Provide an email or a phone number' },
      { name: 'password', label: 'Password', type: 'password', required: true, hideOnEdit: true, helpText: 'Minimum 8 characters' },
      { name: 'phone', label: 'Phone', type: 'text', helpText: 'Provide a phone number or an email' },
      { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
    ],
  },

  // ---------------- Academics ----------------
  'academic-years': {
    key: 'academic-years',
    path: '/academic-years',
    title: 'Academic Years',
    singular: 'Academic year',
    icon: <CalendarRange className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      nameCol,
      { key: 'startDate', header: 'Start', render: (r) => formatDate(r.startDate as string) },
      { key: 'endDate', header: 'End', render: (r) => formatDate(r.endDate as string) },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. 2026' },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
    ],
  },

  sections: {
    key: 'sections',
    path: '/sections',
    title: 'Sections',
    singular: 'Section',
    icon: <Layers className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [nameCol, createdCol],
    fields: [
      { name: 'name', label: 'Section name', type: 'text', required: true, placeholder: 'e.g. A' },
      { name: 'classId', label: 'Class ID', type: 'text', required: true, helpText: 'UUID of the grade-level class (seeded)' },
    ],
  },

  classes: {
    key: 'classes',
    path: '/classes',
    title: 'Classrooms',
    singular: 'Classroom',
    subtitle: 'Class + section + academic year',
    icon: <DoorOpen className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'class', header: 'Classroom', render: (r) => classroomLabel(r) },
      {
        key: 'teacher',
        header: 'Class teacher',
        render: (r) => (r.classTeacher ? fullName(rec(rec(r.classTeacher).user)) : '—'),
      },
      createdCol,
    ],
    fields: [
      { name: 'classId', label: 'Class ID', type: 'text', required: true, helpText: 'UUID of the grade-level class' },
      { name: 'sectionId', label: 'Section', type: 'relation', required: true, relation: { path: '/sections', label: nameLabel } },
      { name: 'academicYearId', label: 'Academic year', type: 'relation', required: true, relation: { path: '/academic-years', label: nameLabel } },
      { name: 'classTeacherId', label: 'Class teacher', type: 'relation', relation: { path: '/teachers', label: teacherLabel } },
    ],
  },

  subjects: {
    key: 'subjects',
    path: '/subjects',
    title: 'Subjects',
    singular: 'Subject',
    icon: <BookOpen className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      nameCol,
      { key: 'code', header: 'Code', render: (r) => <Badge tone="blue">{String(r.code ?? '—')}</Badge> },
      { key: 'description', header: 'Description', render: (r) => String(r.description ?? '—') },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. MATH101' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
  },

  enrollments: {
    key: 'enrollments',
    path: '/enrollments',
    title: 'Enrollments',
    singular: 'Enrollment',
    icon: <Link2 className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'classroom', header: 'Classroom', render: (r) => classroomLabel(rec(r.classRoom)) },
      createdCol,
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'classRoomId', label: 'Classroom', type: 'relation', required: true, relation: { path: '/classes', label: classroomLabel } },
    ],
  },

  routines: {
    key: 'routines',
    path: '/routines',
    title: 'Routines',
    singular: 'Routine',
    subtitle: 'Weekly class timetable',
    icon: <CalendarClock className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student'],
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'day', header: 'Day', render: (r) => <Badge tone="purple">{titleCase(r.day as string)}</Badge> },
      { key: 'time', header: 'Time', render: (r) => `${r.startTime ?? ''} – ${r.endTime ?? ''}` },
      { key: 'subject', header: 'Subject', render: (r) => subjectLabel(rec(r.subject)) },
      { key: 'teacher', header: 'Teacher', render: (r) => teacherLabel(rec(r.teacher)) },
      { key: 'classroom', header: 'Classroom', render: (r) => classroomLabel(rec(r.classRoom)) },
    ],
    fields: [
      { name: 'classRoomId', label: 'Classroom', type: 'relation', required: true, relation: { path: '/classes', label: classroomLabel } },
      { name: 'subjectId', label: 'Subject', type: 'relation', required: true, relation: { path: '/subjects', label: subjectLabel } },
      { name: 'teacherId', label: 'Teacher', type: 'relation', required: true, relation: { path: '/teachers', label: teacherLabel } },
      { name: 'day', label: 'Day', type: 'select', required: true, options: DAY_OPTIONS },
      { name: 'startTime', label: 'Start time', type: 'time', required: true },
      { name: 'endTime', label: 'End time', type: 'time', required: true },
    ],
  },

  'teacher-subject-classes': {
    key: 'teacher-subject-classes',
    path: '/teacher-subject-classes',
    title: 'Teaching Assignments',
    singular: 'Assignment',
    subtitle: 'Which teacher teaches what, where',
    icon: <ListChecks className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'teacher', header: 'Teacher', render: (r) => teacherLabel(rec(r.teacher)) },
      { key: 'subject', header: 'Subject', render: (r) => subjectLabel(rec(r.subject)) },
      { key: 'classroom', header: 'Classroom', render: (r) => classroomLabel(rec(r.classRoom)) },
    ],
    fields: [
      { name: 'teacherId', label: 'Teacher', type: 'relation', required: true, relation: { path: '/teachers', label: teacherLabel } },
      { name: 'subjectId', label: 'Subject', type: 'relation', required: true, relation: { path: '/subjects', label: subjectLabel } },
      { name: 'classRoomId', label: 'Classroom', type: 'relation', required: true, relation: { path: '/classes', label: classroomLabel } },
    ],
  },

  // ---------------- Attendance ----------------
  attendance: {
    key: 'attendance',
    path: '/attendance',
    title: 'Student Attendance',
    singular: 'Attendance record',
    icon: <CheckSquare className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher'],
    writeRoles: [...ADMIN_ROLES, 'Teacher'],
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'date', header: 'Date', render: (r) => formatDate(r.date as string) },
      { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status as string)}>{titleCase(r.status as string)}</Badge> },
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ATTENDANCE_OPTIONS },
    ],
  },

  'teacher-attendance': {
    key: 'teacher-attendance',
    path: '/teacher-attendance',
    title: 'Teacher Attendance',
    singular: 'Attendance record',
    icon: <UserCheck className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'teacher', header: 'Teacher', render: (r) => teacherLabel(rec(r.teacher)) },
      { key: 'date', header: 'Date', render: (r) => formatDate(r.date as string) },
      { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status as string)}>{titleCase(r.status as string)}</Badge> },
    ],
    fields: [
      { name: 'teacherId', label: 'Teacher', type: 'relation', required: true, relation: { path: '/teachers', label: teacherLabel } },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ATTENDANCE_OPTIONS },
    ],
  },

  // ---------------- Examinations ----------------
  exams: {
    key: 'exams',
    path: '/exams',
    title: 'Exams',
    singular: 'Exam',
    icon: <FileText className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      nameCol,
      { key: 'term', header: 'Term', render: (r) => <Badge tone="amber">{String(r.term ?? '—')}</Badge> },
      createdCol,
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'term', label: 'Term', type: 'text', required: true, placeholder: 'e.g. First Term' },
      { name: 'academicYearId', label: 'Academic year', type: 'relation', required: true, relation: { path: '/academic-years', label: nameLabel } },
    ],
  },

  'exam-subjects': {
    key: 'exam-subjects',
    path: '/exam-subjects',
    title: 'Exam Subjects',
    singular: 'Exam subject',
    icon: <ClipboardList className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: ADMIN_ROLES,
    columns: [
      { key: 'exam', header: 'Exam', render: (r) => examLabel(rec(r.exam)) },
      { key: 'subject', header: 'Subject', render: (r) => subjectLabel(rec(r.subject)) },
      { key: 'fullMarks', header: 'Full marks', align: 'right', render: (r) => String(r.fullMarks ?? '—') },
      { key: 'passMarks', header: 'Pass marks', align: 'right', render: (r) => String(r.passMarks ?? '—') },
    ],
    fields: [
      { name: 'examId', label: 'Exam', type: 'relation', required: true, relation: { path: '/exams', label: examLabel } },
      { name: 'subjectId', label: 'Subject', type: 'relation', required: true, relation: { path: '/subjects', label: subjectLabel } },
      { name: 'fullMarks', label: 'Full marks', type: 'number', required: true, min: 0 },
      { name: 'passMarks', label: 'Pass marks', type: 'number', required: true, min: 0 },
    ],
  },

  marks: {
    key: 'marks',
    path: '/marks',
    title: 'Marks',
    singular: 'Mark',
    icon: <PenSquare className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: [...ADMIN_ROLES, 'Teacher'],
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'exam', header: 'Exam', render: (r) => examLabel(rec(r.exam)) },
      { key: 'subject', header: 'Subject', render: (r) => subjectLabel(rec(r.subject)) },
      { key: 'marks', header: 'Marks', align: 'right', render: (r) => <span className="font-semibold text-slate-800">{String(r.marks ?? '—')}</span> },
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'examId', label: 'Exam', type: 'relation', required: true, relation: { path: '/exams', label: examLabel } },
      { name: 'subjectId', label: 'Subject', type: 'relation', required: true, relation: { path: '/subjects', label: subjectLabel } },
      { name: 'marks', label: 'Marks obtained', type: 'number', required: true, min: 0 },
    ],
  },

  results: {
    key: 'results',
    path: '/results',
    title: 'Results',
    singular: 'Result',
    icon: <Award className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: [...ADMIN_ROLES, 'Teacher'],
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'exam', header: 'Exam', render: (r) => examLabel(rec(r.exam)) },
      { key: 'gpa', header: 'GPA', align: 'right', render: (r) => <span className="font-semibold">{String(r.gpa ?? '—')}</span> },
      { key: 'grade', header: 'Grade', render: (r) => <Badge tone="green">{String(r.grade ?? '—')}</Badge> },
      { key: 'position', header: 'Position', align: 'right', render: (r) => String(r.position ?? '—') },
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'examId', label: 'Exam', type: 'relation', required: true, relation: { path: '/exams', label: examLabel } },
      { name: 'gpa', label: 'GPA', type: 'number', required: true, min: 0, step: 0.01 },
      { name: 'grade', label: 'Grade', type: 'text', required: true, placeholder: 'e.g. A+' },
      { name: 'position', label: 'Position', type: 'number', min: 1 },
    ],
  },

  // ---------------- Assignments ----------------
  assignments: {
    key: 'assignments',
    path: '/assignments',
    title: 'Assignments',
    singular: 'Assignment',
    icon: <ClipboardList className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: [...ADMIN_ROLES, 'Teacher'],
    searchable: true,
    columns: [
      { key: 'title', header: 'Title', render: (r) => <span className="font-semibold text-slate-800">{String(r.title ?? '—')}</span> },
      { key: 'subject', header: 'Subject', render: (r) => subjectLabel(rec(r.subject)) },
      { key: 'teacher', header: 'Teacher', render: (r) => teacherLabel(rec(r.teacher)) },
      { key: 'dueDate', header: 'Due', render: (r) => formatDate(r.dueDate as string) },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'subjectId', label: 'Subject', type: 'relation', required: true, relation: { path: '/subjects', label: subjectLabel } },
      { name: 'teacherId', label: 'Teacher', type: 'relation', required: true, relation: { path: '/teachers', label: teacherLabel } },
      { name: 'dueDate', label: 'Due date', type: 'date', required: true },
    ],
  },

  'assignment-submissions': {
    key: 'assignment-submissions',
    path: '/assignment-submissions',
    title: 'Submissions',
    singular: 'Submission',
    icon: <FileText className="h-5 w-5" />,
    viewRoles: [...ADMIN_ROLES, 'Teacher', 'Student', 'Parent'],
    writeRoles: [...ADMIN_ROLES, 'Teacher', 'Student'],
    columns: [
      { key: 'assignment', header: 'Assignment', render: (r) => nameLabel(rec(r.assignment)) },
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'file', header: 'File', render: (r) => (r.file ? <a className="text-brand-600 hover:underline" href={String(r.file)} target="_blank" rel="noreferrer">Open</a> : '—') },
      { key: 'marks', header: 'Marks', align: 'right', render: (r) => String(r.marks ?? '—') },
    ],
    fields: [
      { name: 'assignmentId', label: 'Assignment', type: 'relation', required: true, relation: { path: '/assignments', label: nameLabel } },
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'file', label: 'File URL', type: 'text', required: true, full: true },
      { name: 'marks', label: 'Marks', type: 'number', min: 0 },
    ],
  },

  // ---------------- Finance ----------------
  fees: {
    key: 'fees',
    path: '/fees',
    title: 'Fees',
    singular: 'Fee',
    icon: <Banknote className="h-5 w-5" />,
    viewRoles: STAFF_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      nameCol,
      { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold text-slate-800">{formatMoney(Number(r.amount))}</span> },
      createdCol,
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01 },
    ],
  },

  'student-fees': {
    key: 'student-fees',
    path: '/student-fees',
    title: 'Student Fees',
    singular: 'Student fee',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    viewRoles: [...STAFF_ROLES, 'Student', 'Parent'],
    writeRoles: STAFF_ROLES,
    columns: [
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'fee', header: 'Fee', render: (r) => nameLabel(rec(r.fee)) },
      { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatMoney(Number(r.amount)) },
      { key: 'dueDate', header: 'Due', render: (r) => formatDate(r.dueDate as string) },
    ],
    fields: [
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'feeId', label: 'Fee', type: 'relation', required: true, relation: { path: '/fees', label: feeLabel } },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01 },
      { name: 'dueDate', label: 'Due date', type: 'date', required: true },
    ],
  },

  payments: {
    key: 'payments',
    path: '/payments',
    title: 'Payments',
    singular: 'Payment',
    icon: <CreditCard className="h-5 w-5" />,
    viewRoles: [...STAFF_ROLES, 'Student', 'Parent'],
    writeRoles: STAFF_ROLES,
    columns: [
      { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold text-slate-800">{formatMoney(Number(r.amount))}</span> },
      { key: 'method', header: 'Method', render: (r) => <Badge tone="blue">{titleCase(r.method as string)}</Badge> },
      { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status as string)}>{titleCase(r.status as string)}</Badge> },
      createdCol,
    ],
    fields: [
      { name: 'studentFeeId', label: 'Student fee', type: 'relation', required: true, relation: { path: '/student-fees', label: (i) => `${formatMoney(Number(i.amount))} · ${String(i.id).slice(0, 8)}` } },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01 },
      { name: 'method', label: 'Method', type: 'select', required: true, options: PAYMENT_METHODS },
      { name: 'status', label: 'Status', type: 'select', options: PAYMENT_STATUS },
    ],
  },

  invoices: {
    key: 'invoices',
    path: '/invoices',
    title: 'Invoices',
    singular: 'Invoice',
    icon: <ReceiptText className="h-5 w-5" />,
    viewRoles: [...STAFF_ROLES, 'Student', 'Parent'],
    writeRoles: STAFF_ROLES,
    searchable: true,
    columns: [
      { key: 'invoiceNo', header: 'Invoice #', render: (r) => <span className="font-mono text-sm font-semibold">{String(r.invoiceNo ?? '—')}</span> },
      { key: 'payment', header: 'Payment', render: (r) => formatMoney(Number(rec(r.payment).amount)) },
      createdCol,
    ],
    fields: [
      { name: 'paymentId', label: 'Payment', type: 'relation', required: true, relation: { path: '/payments', label: (i) => `${formatMoney(Number(i.amount))} · ${String(i.id).slice(0, 8)}` } },
      { name: 'invoiceNo', label: 'Invoice number', type: 'text', required: true },
    ],
  },

  // ---------------- Library ----------------
  'library-books': {
    key: 'library-books',
    path: '/library-books',
    title: 'Library Books',
    singular: 'Book',
    icon: <Library className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: STAFF_ROLES,
    searchable: true,
    columns: [
      { key: 'title', header: 'Title', render: (r) => <span className="font-semibold text-slate-800">{String(r.title ?? '—')}</span> },
      { key: 'author', header: 'Author', render: (r) => String(r.author ?? '—') },
      { key: 'isbn', header: 'ISBN', render: (r) => <span className="font-mono text-xs">{String(r.isbn ?? '—')}</span> },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'isbn', label: 'ISBN', type: 'text', required: true },
    ],
  },

  'book-issues': {
    key: 'book-issues',
    path: '/book-issues',
    title: 'Book Issues',
    singular: 'Book issue',
    icon: <BookMarked className="h-5 w-5" />,
    viewRoles: [...STAFF_ROLES, 'Student', 'Parent'],
    writeRoles: STAFF_ROLES,
    columns: [
      { key: 'book', header: 'Book', render: (r) => nameLabel(rec(r.book)) },
      { key: 'student', header: 'Student', render: (r) => studentLabel(rec(r.student)) },
      { key: 'issueDate', header: 'Issued', render: (r) => formatDate(r.issueDate as string) },
      { key: 'returnDate', header: 'Return', render: (r) => formatDate(r.returnDate as string) },
    ],
    fields: [
      { name: 'bookId', label: 'Book', type: 'relation', required: true, relation: { path: '/library-books', label: nameLabel } },
      { name: 'studentId', label: 'Student', type: 'relation', required: true, relation: { path: '/students', label: studentLabel } },
      { name: 'issueDate', label: 'Issue date', type: 'date', required: true },
      { name: 'returnDate', label: 'Return date', type: 'date' },
    ],
  },

  // ---------------- Transport ----------------
  'transport-routes': {
    key: 'transport-routes',
    path: '/transport-routes',
    title: 'Transport Routes',
    singular: 'Route',
    icon: <Route className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: STAFF_ROLES,
    searchable: true,
    columns: [nameCol, createdCol],
    fields: [{ name: 'name', label: 'Route name', type: 'text', required: true }],
  },

  buses: {
    key: 'buses',
    path: '/buses',
    title: 'Buses',
    singular: 'Bus',
    icon: <Bus className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: STAFF_ROLES,
    searchable: true,
    columns: [
      { key: 'busNo', header: 'Bus No.', render: (r) => <Badge tone="amber">{String(r.busNo ?? '—')}</Badge> },
      { key: 'driver', header: 'Driver', render: (r) => String(r.driver ?? '—') },
      createdCol,
    ],
    fields: [
      { name: 'busNo', label: 'Bus number', type: 'text', required: true },
      { name: 'driver', label: 'Driver name', type: 'text', required: true },
    ],
  },

  // ---------------- Communication ----------------
  notices: {
    key: 'notices',
    path: '/notices',
    title: 'Notices',
    singular: 'Notice',
    icon: <Megaphone className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: [...STAFF_ROLES, 'Teacher'],
    searchable: true,
    columns: [
      { key: 'title', header: 'Title', render: (r) => <span className="font-semibold text-slate-800">{String(r.title ?? '—')}</span> },
      { key: 'description', header: 'Description', render: (r) => <span className="line-clamp-1 max-w-md text-slate-500">{String(r.description ?? '—')}</span> },
      createdCol,
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true },
      { name: 'publishedBy', label: 'Published by', type: 'relation', required: true, relation: { path: '/users', label: userLabel } },
    ],
  },

  events: {
    key: 'events',
    path: '/events',
    title: 'Events',
    singular: 'Event',
    icon: <CalendarHeart className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: STAFF_ROLES,
    searchable: true,
    columns: [
      { key: 'title', header: 'Title', render: (r) => <span className="font-semibold text-slate-800">{String(r.title ?? '—')}</span> },
      { key: 'eventDate', header: 'Date', render: (r) => formatDate(r.eventDate as string) },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'eventDate', label: 'Event date', type: 'date', required: true },
    ],
  },

  notifications: {
    key: 'notifications',
    path: '/notifications',
    title: 'Notifications',
    singular: 'Notification',
    icon: <Bell className="h-5 w-5" />,
    viewRoles: undefined,
    writeRoles: STAFF_ROLES,
    columns: [
      { key: 'title', header: 'Title', render: (r) => String(r.title ?? '—') },
      { key: 'user', header: 'User', render: (r) => fullName(rec(r.user)) },
      { key: 'isRead', header: 'Read', render: (r) => <Badge tone={r.isRead ? 'green' : 'slate'}>{r.isRead ? 'Read' : 'Unread'}</Badge> },
      createdCol,
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'relation', required: true, relation: { path: '/users', label: userLabel } },
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'isRead', label: 'Mark as read', type: 'checkbox' },
    ],
  },

  documents: {
    key: 'documents',
    path: '/documents',
    title: 'Documents',
    singular: 'Document',
    icon: <Files className="h-5 w-5" />,
    viewRoles: [...STAFF_ROLES, 'Teacher'],
    writeRoles: [...STAFF_ROLES, 'Teacher'],
    columns: [
      { key: 'ownerType', header: 'Owner type', render: (r) => <Badge tone="blue">{String(r.ownerType ?? '—')}</Badge> },
      { key: 'fileUrl', header: 'File', render: (r) => (r.fileUrl ? <a className="text-brand-600 hover:underline" href={String(r.fileUrl)} target="_blank" rel="noreferrer">Open</a> : '—') },
      createdCol,
    ],
    fields: [
      { name: 'ownerType', label: 'Owner type', type: 'text', required: true, placeholder: 'e.g. student' },
      { name: 'ownerId', label: 'Owner ID', type: 'text', required: true, helpText: 'UUID of the related record' },
      { name: 'fileUrl', label: 'File URL', type: 'text', required: true, full: true },
    ],
  },

  // ---------------- Administration ----------------
  roles: {
    key: 'roles',
    path: '/roles',
    title: 'Roles',
    singular: 'Role',
    icon: <ShieldCheck className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    columns: [
      nameCol,
      {
        key: 'permissions',
        header: 'Permissions',
        render: (r) => {
          const perms = (r.permissions as Record<string, unknown>[]) ?? []
          return <Badge tone="purple">{perms.length} permissions</Badge>
        },
      },
    ],
    fields: [
      { name: 'name', label: 'Role name', type: 'text', required: true },
      { name: 'permissionIds', label: 'Permissions', type: 'multi-relation', relation: { path: '/permissions', label: nameLabel }, full: true },
    ],
  },

  permissions: {
    key: 'permissions',
    path: '/permissions',
    title: 'Permissions',
    singular: 'Permission',
    icon: <KeyRound className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [nameCol, createdCol],
    fields: [{ name: 'name', label: 'Permission name', type: 'text', required: true }],
  },

  settings: {
    key: 'settings',
    path: '/settings',
    title: 'Settings',
    singular: 'Setting',
    icon: <Settings2 className="h-5 w-5" />,
    viewRoles: STAFF_ROLES,
    writeRoles: ADMIN_ROLES,
    searchable: true,
    columns: [
      { key: 'key', header: 'Key', render: (r) => <span className="font-mono text-sm font-semibold">{String(r.key ?? '—')}</span> },
      { key: 'value', header: 'Value', render: (r) => String(r.value ?? '—') },
    ],
    fields: [
      { name: 'key', label: 'Key', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'text', required: true, full: true },
    ],
  },

  'audit-logs': {
    key: 'audit-logs',
    path: '/audit-logs',
    title: 'Audit Logs',
    singular: 'Audit log',
    icon: <ScrollText className="h-5 w-5" />,
    viewRoles: ADMIN_ROLES,
    writeRoles: ADMIN_ROLES,
    readOnly: true,
    columns: [
      { key: 'action', header: 'Action', render: (r) => <Badge tone="blue">{String(r.action ?? '—')}</Badge> },
      { key: 'tableName', header: 'Table', render: (r) => <span className="font-mono text-xs">{String(r.tableName ?? '—')}</span> },
      { key: 'user', header: 'User', render: (r) => fullName(rec(r.user)) },
      { key: 'createdAt', header: 'When', render: (r) => formatDate(r.createdAt as string) },
    ],
    fields: [],
  },
}

export const RESOURCE_LIST = Object.values(RESOURCES)

export function getResource(key: string): ResourceConfig | undefined {
  return RESOURCES[key]
}

// re-export for convenience
export { get }
