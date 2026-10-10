import {
  getCrmDoctypePermissions,
  type CrmDoctypePermissions,
} from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";

export interface StudentConfigurationPermissions {
  needGroups: CrmDoctypePermissions;
  needs: CrmDoctypePermissions;
  tagGroups: CrmDoctypePermissions;
  tags: CrmDoctypePermissions;
  admissionProfileTemplates: CrmDoctypePermissions;
  admissionDocumentTypes: CrmDoctypePermissions;
  admissionMethods: CrmDoctypePermissions;
}

export function getStudentConfigurationPermissions(
  user: CurrentUser | null | undefined,
): StudentConfigurationPermissions {
  return {
    needGroups: getCrmDoctypePermissions(user, "CRM Need Group"),
    needs: getCrmDoctypePermissions(user, "CRM Need"),
    tagGroups: getCrmDoctypePermissions(user, "CRM Tag Group"),
    tags: getCrmDoctypePermissions(user, "CRM Tag"),
    admissionProfileTemplates: getCrmDoctypePermissions(
      user,
      "CRM Admission Profile Template",
    ),
    admissionDocumentTypes: getCrmDoctypePermissions(user, "CRM Document Type"),
    admissionMethods: getCrmDoctypePermissions(user, "CRM Admission Method"),
  };
}

export interface MajorCatalogPermissions {
  majors: CrmDoctypePermissions;
  majorGroups: CrmDoctypePermissions;
  educationPrograms: CrmDoctypePermissions;
  provinces: CrmDoctypePermissions;
  wards: CrmDoctypePermissions;
  highSchools: CrmDoctypePermissions;
  schoolAreas: CrmDoctypePermissions;
  admissionYears: CrmDoctypePermissions;
  campaignChannelTypes: CrmDoctypePermissions;
}

export function getMajorCatalogPermissions(
  user: CurrentUser | null | undefined,
): MajorCatalogPermissions {
  return {
    majors: getCrmDoctypePermissions(user, "CRM Major"),
    majorGroups: getCrmDoctypePermissions(user, "CRM Major Group"),
    educationPrograms: getCrmDoctypePermissions(
      user,
      "CRM Education Program",
    ),
    provinces: getCrmDoctypePermissions(user, "CRM Province"),
    wards: getCrmDoctypePermissions(user, "CRM Ward"),
    highSchools: getCrmDoctypePermissions(user, "CRM High School"),
    schoolAreas: getCrmDoctypePermissions(user, "CRM School Area"),
    admissionYears: getCrmDoctypePermissions(user, "CRM Admission Year"),
    campaignChannelTypes: getCrmDoctypePermissions(
      user,
      "CRM Campaign Channel Type",
    ),
  };
}
