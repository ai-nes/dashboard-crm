export interface MajorGroupOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  sortOrder: number;
  modified?: string | null;
}

export interface MajorOption {
  id: string;
  code?: string | null;
  name: string;
  degreeName?: string | null;
  majorGroup?: string | null;
  majorGroupName?: string | null;
  isActive: boolean;
  modified?: string | null;
}

export interface MajorGroupCatalog {
  groups: MajorGroupOption[];
  total?: number;
  start?: number;
  pageLength?: number;
}

export interface MajorCatalog {
  majors: MajorOption[];
  total?: number;
  start?: number;
  pageLength?: number;
}

export interface MajorGroupMutationInput {
  code: string;
  display_name: string;
  description?: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface MajorMutationInput {
  major_name: string;
  major_code?: string | null;
  degree_name?: string | null;
  major_group: string;
  is_active: boolean;
}

export interface UpdateMajorGroupInput {
  name: string;
  data: MajorGroupMutationInput;
  expectedModified?: string | null;
}

export interface UpdateMajorInput {
  name: string;
  data: MajorMutationInput;
  expectedModified?: string | null;
}

export interface DeleteMajorGroupInput {
  name: string;
  expectedModified?: string | null;
}

export interface DeleteMajorInput {
  name: string;
  expectedModified?: string | null;
}
