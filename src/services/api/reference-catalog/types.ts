export interface ProvinceOption {
  id: string;
  code: string;
  name: string;
  region?: string | null;
  regionName?: string | null;
  cityType?: string | null;
  modified?: string | null;
}

export interface WardOption {
  id: string;
  code: string;
  name: string;
  wardType?: string | null;
  province?: string | null;
  provinceName?: string | null;
  zone?: string | null;
  zoneName?: string | null;
  modified?: string | null;
}

export interface SchoolOption {
  id: string;
  code: string;
  name: string;
  schoolType?: string | null;
  schoolTypeName?: string | null;
  schoolArea?: string | null;
  schoolAreaName?: string | null;
  schoolTier?: string | null;
  boardingType?: string | null;
  isActive: boolean;
  province: string;
  provinceName?: string | null;
  ward: string;
  wardName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  modified?: string | null;
}

export interface SchoolAreaOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  sortOrder: number;
  modified?: string | null;
}

export interface CatalogPage<T> {
  total?: number;
  start?: number;
  pageLength?: number;
  items: T[];
}

export type ProvinceCatalog = Omit<CatalogPage<ProvinceOption>, "items"> & {
  provinces: ProvinceOption[];
};

export type WardCatalog = Omit<CatalogPage<WardOption>, "items"> & {
  wards: WardOption[];
};

export type SchoolCatalog = Omit<CatalogPage<SchoolOption>, "items"> & {
  schools: SchoolOption[];
};

export type SchoolAreaCatalog = Omit<CatalogPage<SchoolAreaOption>, "items"> & {
  schoolAreas: SchoolAreaOption[];
};

export interface ProvinceMutationInput {
  province_code: string;
  province_name: string;
  region?: string | null;
  city_type?: string | null;
}

export interface WardMutationInput {
  ward_code: string;
  ward_name: string;
  ward_type: string;
  province: string;
  zone?: string | null;
}

export interface SchoolMutationInput {
  school_name: string;
  school_code: string;
  school_type?: string | null;
  school_area?: string | null;
  school_tier?: string | null;
  boarding_type?: string | null;
  is_active: boolean;
  province: string;
  ward: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface SchoolAreaMutationInput {
  code: string;
  display_name: string;
  description?: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface UpdateProvinceInput {
  name: string;
  data: Partial<ProvinceMutationInput>;
  expectedModified?: string | null;
}

export interface UpdateWardInput {
  name: string;
  data: Partial<WardMutationInput>;
  expectedModified?: string | null;
}

export interface UpdateSchoolInput {
  name: string;
  data: Partial<SchoolMutationInput>;
  expectedModified?: string | null;
}

export interface UpdateSchoolAreaInput {
  name: string;
  data: Partial<SchoolAreaMutationInput>;
  expectedModified?: string | null;
}

export interface DeleteCatalogInput {
  name: string;
  expectedModified?: string | null;
}

export interface GeographyOption {
  id: string;
  code?: string | null;
  name: string;
  province?: string | null;
  zone?: string | null;
}

export interface GeographyOptions {
  regions: GeographyOption[];
  provinces: GeographyOption[];
  wards: GeographyOption[];
  zones: GeographyOption[];
  schoolAreas: GeographyOption[];
  schoolTypes: GeographyOption[];
}
