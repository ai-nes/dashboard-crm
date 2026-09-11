export interface AdmissionMethodOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  enabled?: boolean;
  modified?: string | null;
}

export interface AdmissionYearOption {
  id: string;
  name: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AdmissionOfferingOption {
  id: string;
  offeringKey: string;
  admissionYear: string;
  admissionYearName: string;
  campus: string;
  major: string;
  admissionMethod: string;
  admissionMethodName: string;
  quota: number;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  status: string;
  label: string;
}

export interface AdmissionProfileRequirement {
  sectionCode: string;
  documentType: string;
  documentCode: string;
  documentLabel: string;
  category?: string | null;
  description?: string | null;
  requirementGroup: string;
  requirementMode: "ALL" | "ANY";
  isRequired: boolean;
  minimumRequired: number;
  quantity: number;
  orderDisplay: number;
  conditionKey?: string | null;
  instruction?: string | null;
}

export interface AdmissionProfileTemplateOption {
  id: string;
  code: string;
  name: string;
  templateKind: "standard" | "special";
  profileType: string;
  status: AdmissionProfileTemplateStatus;
  version: number;
  educationProgram?: string | null;
  admissionMethod?: string | null;
  description?: string | null;
  modified?: string | null;
  requirements: AdmissionProfileRequirement[];
}

export type AdmissionProfileTemplateStatus = "Draft" | "Active" | "Archived";

export interface AdmissionProfileTemplateRequirementInput {
  section_code: string;
  document_type: string;
  requirement_group: string;
  requirement_mode: "ALL" | "ANY";
  is_required: boolean;
  min_required: number;
  quantity: number;
  order_display: number;
  condition_key?: string | null;
  instruction?: string | null;
}

export interface AdmissionProfileTemplateMutationInput {
  template_code: string;
  template_name: string;
  template_kind: "standard" | "special";
  profile_type: "academic_admission";
  status: AdmissionProfileTemplateStatus;
  version: number;
  education_program?: string | null;
  admission_method?: string | null;
  description?: string | null;
  requirements: AdmissionProfileTemplateRequirementInput[];
}

export interface AdmissionDocumentTypeOption {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  conditionalKey?: string | null;
  status?: AdmissionDocumentTypeStatus;
  isActive?: boolean;
  modified?: string | null;
}

export type AdmissionDocumentTypeStatus = 'Active' | 'Archived'

export interface AdmissionDocumentTypeMutationInput {
  code: string
  label: string
  category: string
  description?: string | null
  conditional_key?: string | null
  status: AdmissionDocumentTypeStatus
  is_active: boolean
}

export interface AdmissionMethodMutationInput {
  code: string
  display_name: string
  description?: string | null
  enabled: boolean
  sort_order: number
}

export interface AdmissionDocumentTypeCatalog {
  documentTypes: AdmissionDocumentTypeOption[]
}

export interface AdmissionMethodCatalog {
  methods: AdmissionMethodOption[]
}

export interface AdmissionProfileCatalog {
  methods: AdmissionMethodOption[];
  years: AdmissionYearOption[];
  offerings: AdmissionOfferingOption[];
  documentTypes: AdmissionDocumentTypeOption[];
  templates: AdmissionProfileTemplateOption[];
  specialTemplates: AdmissionProfileTemplateOption[];
}

export interface AdminAdmissionProfileTemplateCatalog {
  templates: AdmissionProfileTemplateOption[];
  documentTypes: AdmissionDocumentTypeOption[];
}

export interface CreateAdmissionApplicationInput {
  student: string;
  values: {
    offering?: string;
    admission_year?: string;
    admission_method: string;
    profile_template: string;
    special_profile_options?: string[];
    preference_order: number;
    preference: "Primary" | "Alternative";
    status: "Draft";
  };
  expectedRevision: number;
  idempotencyKey: string;
}

export interface CreateAdmissionApplicationResponse {
  application: string;
  student: string;
  admission_profile: string;
  profile_created: boolean;
  profile_template: string;
  special_profile_options?: string[];
  document_checklist: AdmissionProfileRequirement[];
  document_completeness: Record<string, unknown>;
  replayed?: boolean;
  revision?: number;
}

export interface UploadStudentAdmissionDocumentInput {
  student: string;
  profile: string;
  documentType: string;
  application?: string | null;
  file: File;
}

export interface UploadStudentAdmissionDocumentResponse {
  document: {
    id: string;
    student: string;
    profile: string;
    documentType: string;
    application?: string | null;
    file: string;
    isPrivate: boolean;
    status: string;
    version: number;
    sourceReference?: string | null;
  };
  file: {
    id: string;
    fileName: string;
    fileUrl: string;
    isPrivate: boolean;
  };
  documentCompleteness: Record<string, unknown>;
}

export interface UpdateAdmissionApplicationPreferenceInput {
  application: string;
  preference: "Primary" | "Alternative";
}

export interface UpdateAdmissionApplicationPreferenceResponse {
  application: string;
  student: string;
  preference: "Primary" | "Alternative";
  preference_order: number;
}

export interface UpdateAdmissionApplicationInput {
  application: string;
  values: {
    admission_method: string;
    profile_template: string;
    special_profile_options?: string[];
    preference: "Primary" | "Alternative";
  };
}

export interface UpdateAdmissionApplicationResponse {
  application: string;
  student: string;
  admission_method: string;
  preference: "Primary" | "Alternative";
  preference_order: number;
  admission_profile: string;
  profile_created: boolean;
  profile_template: string;
  special_profile_options?: string[];
  document_checklist: AdmissionProfileRequirement[];
  document_completeness: Record<string, unknown>;
}
