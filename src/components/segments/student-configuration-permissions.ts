import {hasFrappeTechnicalRole} from '@/components/common/auth/rbac'

export function canManageStudentConfiguration(roles?: readonly string[] | null): boolean {
  return Boolean(
    hasFrappeTechnicalRole(roles, 'System Manager') ||
      roles?.includes('Administrator') ||
      roles?.includes('Admissions Director'),
  )
}

export function canManageAdmissionDocumentTypes(roles?: readonly string[] | null): boolean {
  return hasFrappeTechnicalRole(roles, 'System Manager')
}

export function canDeleteAdmissionDocumentTypes(roles?: readonly string[] | null): boolean {
  return hasFrappeTechnicalRole(roles, 'System Manager')
}

export function canManageAdmissionMethods(roles?: readonly string[] | null): boolean {
  return hasFrappeTechnicalRole(roles, 'System Manager')
}

export function canDeleteAdmissionMethods(roles?: readonly string[] | null): boolean {
  return canManageAdmissionMethods(roles)
}
