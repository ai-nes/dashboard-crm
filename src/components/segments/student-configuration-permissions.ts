import {hasFrappeTechnicalRole} from '@/components/common/auth/rbac'

export function canManageStudentConfiguration(roles?: readonly string[] | null): boolean {
  return Boolean(
    hasFrappeTechnicalRole(roles, 'System Manager') ||
      roles?.includes('Administrator') ||
      roles?.includes('Admissions Director'),
  )
}
