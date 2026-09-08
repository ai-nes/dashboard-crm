# FAIP Segment Filter — Frontend Enum & Vietnamese Labels

## 1. Phạm vi

FAIP Segment hiện tại chỉ sử dụng **Student Properties** để tạo điều kiện.

Không sử dụng:

- Grade
- Interactions
- Tags
- Memberships
- First Source
- Referrer
- Scholarship Interest
- Admission Status riêng
- Interest Level
- Fit Level
- Main Barrier

Cấu trúc mỗi điều kiện:

```text
[ Property ] [ Operator ] [ Value ]
```

Ví dụ:

```text
Lead Score >= 80
Journey Stage is any of Qualified
Program Interest is any of Software Engineering
Source is any of Open Day
```

---

## 2. Segment Filter Category

```ts
export enum SegmentFilterCategory {
  STUDENT_PROFILE = "STUDENT_PROFILE",
  SOURCE = "SOURCE",
  ACADEMIC = "ACADEMIC",
  SCORING_STATUS = "SCORING_STATUS",
}

export const SEGMENT_FILTER_CATEGORY_LABEL: Record<
  SegmentFilterCategory,
  string
> = {
  [SegmentFilterCategory.STUDENT_PROFILE]: "Thông tin thí sinh",
  [SegmentFilterCategory.SOURCE]: "Nguồn",
  [SegmentFilterCategory.ACADEMIC]: "Học tập",
  [SegmentFilterCategory.SCORING_STATUS]: "Điểm & trạng thái",
};
```

---

## 3. Student Segment Property

```ts
export enum StudentSegmentProperty {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  PROVINCE_AREA = "PROVINCE_AREA",
  YEAR_OF_BIRTH = "YEAR_OF_BIRTH",
  PROGRAM_INTEREST = "PROGRAM_INTEREST",
  PARENT_INFORMATION = "PARENT_INFORMATION",

  SOURCE = "SOURCE",

  ACADEMIC_SCORE = "ACADEMIC_SCORE",

  LEAD_SCORE = "LEAD_SCORE",
  JOURNEY_STAGE = "JOURNEY_STAGE",
}

export const STUDENT_SEGMENT_PROPERTY_LABEL: Record<
  StudentSegmentProperty,
  string
> = {
  [StudentSegmentProperty.HIGH_SCHOOL]: "Trường THPT",
  [StudentSegmentProperty.PROVINCE_AREA]: "Tỉnh / Khu vực",
  [StudentSegmentProperty.YEAR_OF_BIRTH]: "Năm sinh",
  [StudentSegmentProperty.PROGRAM_INTEREST]: "Ngành quan tâm",
  [StudentSegmentProperty.PARENT_INFORMATION]: "Thông tin phụ huynh",

  [StudentSegmentProperty.SOURCE]: "Nguồn",

  [StudentSegmentProperty.ACADEMIC_SCORE]: "Điểm học tập / GPA",

  [StudentSegmentProperty.LEAD_SCORE]: "Điểm Lead",
  [StudentSegmentProperty.JOURNEY_STAGE]: "Trạng thái Lead",
};
```

### Mapping theo category

| Category | Property | Label |
|---|---|---|
| `STUDENT_PROFILE` | `HIGH_SCHOOL` | Trường THPT |
| `STUDENT_PROFILE` | `PROVINCE_AREA` | Tỉnh / Khu vực |
| `STUDENT_PROFILE` | `YEAR_OF_BIRTH` | Năm sinh |
| `STUDENT_PROFILE` | `PROGRAM_INTEREST` | Ngành quan tâm |
| `STUDENT_PROFILE` | `PARENT_INFORMATION` | Thông tin phụ huynh |
| `SOURCE` | `SOURCE` | Nguồn |
| `ACADEMIC` | `ACADEMIC_SCORE` | Điểm học tập / GPA |
| `SCORING_STATUS` | `LEAD_SCORE` | Điểm Lead |
| `SCORING_STATUS` | `JOURNEY_STAGE` | Trạng thái Lead |

---

## 4. Segment Operator

```ts
export enum SegmentOperator {
  IS_ANY_OF = "IS_ANY_OF",
  IS_NONE_OF = "IS_NONE_OF",

  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  BETWEEN = "BETWEEN",

  BEFORE = "BEFORE",
  AFTER = "AFTER",

  IS_KNOWN = "IS_KNOWN",
  IS_UNKNOWN = "IS_UNKNOWN",
}

export const SEGMENT_OPERATOR_LABEL: Record<SegmentOperator, string> = {
  [SegmentOperator.IS_ANY_OF]: "Là một trong",
  [SegmentOperator.IS_NONE_OF]: "Không thuộc",

  [SegmentOperator.EQUAL]: "Bằng",
  [SegmentOperator.NOT_EQUAL]: "Không bằng",
  [SegmentOperator.GREATER_THAN]: "Lớn hơn",
  [SegmentOperator.GREATER_THAN_OR_EQUAL]: "Lớn hơn hoặc bằng",
  [SegmentOperator.LESS_THAN]: "Nhỏ hơn",
  [SegmentOperator.LESS_THAN_OR_EQUAL]: "Nhỏ hơn hoặc bằng",
  [SegmentOperator.BETWEEN]: "Trong khoảng",

  [SegmentOperator.BEFORE]: "Trước",
  [SegmentOperator.AFTER]: "Sau",

  [SegmentOperator.IS_KNOWN]: "Đã có dữ liệu",
  [SegmentOperator.IS_UNKNOWN]: "Chưa có dữ liệu",
};
```

---

## 5. Journey Stage

```ts
export enum JourneyStage {
  NEW = "NEW",
  ATTEMPTING = "ATTEMPTING",
  CONNECTED = "CONNECTED",
  QUALIFIED = "QUALIFIED",
  DISQUALIFIED = "DISQUALIFIED",
}

export const JOURNEY_STAGE_LABEL: Record<JourneyStage, string> = {
  [JourneyStage.NEW]: "Mới",
  [JourneyStage.ATTEMPTING]: "Đang liên hệ",
  [JourneyStage.CONNECTED]: "Đã kết nối",
  [JourneyStage.QUALIFIED]: "Đủ điều kiện",
  [JourneyStage.DISQUALIFIED]: "Không đủ điều kiện",
};
```

---

## 6. Dropdown 2 và Dropdown 3

| Property | Dropdown 2 — Operator | Dropdown 3 — Value |
|---|---|---|
| Trường THPT | Là một trong / Không thuộc / Đã có dữ liệu / Chưa có dữ liệu | Search + multi-select trường THPT |
| Tỉnh / Khu vực | Là một trong / Không thuộc / Đã có dữ liệu / Chưa có dữ liệu | Search + multi-select tỉnh/khu vực |
| Năm sinh | Bằng / Không bằng / Trước / Sau / Trong khoảng / Đã có dữ liệu / Chưa có dữ liệu | Nhập/chọn năm |
| Ngành quan tâm | Là một trong / Không thuộc / Đã có dữ liệu / Chưa có dữ liệu | Search + multi-select ngành |
| Thông tin phụ huynh | Đã có dữ liệu / Chưa có dữ liệu | Không cần Value |
| Nguồn | Là một trong / Không thuộc / Đã có dữ liệu / Chưa có dữ liệu | Search + multi-select nguồn |
| Điểm học tập / GPA | = / ≠ / > / ≥ / < / ≤ / Trong khoảng / Đã có dữ liệu / Chưa có dữ liệu | Numeric input |
| Điểm Lead | = / ≠ / > / ≥ / < / ≤ / Trong khoảng / Đã có dữ liệu / Chưa có dữ liệu | Numeric input |
| Trạng thái Lead | Là một trong / Không thuộc / Đã có dữ liệu / Chưa có dữ liệu | New / Attempting / Connected / Qualified / Disqualified |

### UI rule

- Nếu operator là `IS_KNOWN` hoặc `IS_UNKNOWN` → **ẩn Dropdown 3**.
- Nếu operator là `BETWEEN` → Dropdown 3 hiển thị **2 input**.
- Giá trị Trường THPT, Tỉnh/Khu vực, Ngành, Nguồn → lấy từ **API/master data**, không hard-code enum.
- `JourneyStage` là enum cố định ở frontend/backend.
- `Lead Score` và `Academic Score / GPA` là numeric input.

---

## 7. Property Config

```ts
export type SegmentValueType =
  | "MULTI_SELECT"
  | "NUMBER"
  | "YEAR"
  | "PRESENCE";

export interface SegmentPropertyConfig {
  label: string;
  category: SegmentFilterCategory;
  valueType: SegmentValueType;
  operators: SegmentOperator[];
}

export const SEGMENT_PROPERTY_CONFIG: Record<
  StudentSegmentProperty,
  SegmentPropertyConfig
> = {
  [StudentSegmentProperty.HIGH_SCHOOL]: {
    label: "Trường THPT",
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: [
      SegmentOperator.IS_ANY_OF,
      SegmentOperator.IS_NONE_OF,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.PROVINCE_AREA]: {
    label: "Tỉnh / Khu vực",
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: [
      SegmentOperator.IS_ANY_OF,
      SegmentOperator.IS_NONE_OF,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.YEAR_OF_BIRTH]: {
    label: "Năm sinh",
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "YEAR",
    operators: [
      SegmentOperator.EQUAL,
      SegmentOperator.NOT_EQUAL,
      SegmentOperator.BEFORE,
      SegmentOperator.AFTER,
      SegmentOperator.BETWEEN,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.PROGRAM_INTEREST]: {
    label: "Ngành quan tâm",
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "MULTI_SELECT",
    operators: [
      SegmentOperator.IS_ANY_OF,
      SegmentOperator.IS_NONE_OF,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.PARENT_INFORMATION]: {
    label: "Thông tin phụ huynh",
    category: SegmentFilterCategory.STUDENT_PROFILE,
    valueType: "PRESENCE",
    operators: [
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.SOURCE]: {
    label: "Nguồn",
    category: SegmentFilterCategory.SOURCE,
    valueType: "MULTI_SELECT",
    operators: [
      SegmentOperator.IS_ANY_OF,
      SegmentOperator.IS_NONE_OF,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.ACADEMIC_SCORE]: {
    label: "Điểm học tập / GPA",
    category: SegmentFilterCategory.ACADEMIC,
    valueType: "NUMBER",
    operators: [
      SegmentOperator.EQUAL,
      SegmentOperator.NOT_EQUAL,
      SegmentOperator.GREATER_THAN,
      SegmentOperator.GREATER_THAN_OR_EQUAL,
      SegmentOperator.LESS_THAN,
      SegmentOperator.LESS_THAN_OR_EQUAL,
      SegmentOperator.BETWEEN,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.LEAD_SCORE]: {
    label: "Điểm Lead",
    category: SegmentFilterCategory.SCORING_STATUS,
    valueType: "NUMBER",
    operators: [
      SegmentOperator.EQUAL,
      SegmentOperator.NOT_EQUAL,
      SegmentOperator.GREATER_THAN,
      SegmentOperator.GREATER_THAN_OR_EQUAL,
      SegmentOperator.LESS_THAN,
      SegmentOperator.LESS_THAN_OR_EQUAL,
      SegmentOperator.BETWEEN,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },

  [StudentSegmentProperty.JOURNEY_STAGE]: {
    label: "Trạng thái Lead",
    category: SegmentFilterCategory.SCORING_STATUS,
    valueType: "MULTI_SELECT",
    operators: [
      SegmentOperator.IS_ANY_OF,
      SegmentOperator.IS_NONE_OF,
      SegmentOperator.IS_KNOWN,
      SegmentOperator.IS_UNKNOWN,
    ],
  },
};
```

---

## 8. Ví dụ condition

```ts
const condition = {
  property: StudentSegmentProperty.LEAD_SCORE,
  operator: SegmentOperator.GREATER_THAN_OR_EQUAL,
  value: 80,
};
```

```ts
const condition = {
  property: StudentSegmentProperty.JOURNEY_STAGE,
  operator: SegmentOperator.IS_ANY_OF,
  value: [JourneyStage.QUALIFIED],
};
```

```ts
const condition = {
  property: StudentSegmentProperty.PROGRAM_INTEREST,
  operator: SegmentOperator.IS_ANY_OF,
  value: ["SOFTWARE_ENGINEERING"],
};
```

---

## 9. Ví dụ Group

```ts
const group = {
  logic: "AND",
  conditions: [
    {
      property: StudentSegmentProperty.LEAD_SCORE,
      operator: SegmentOperator.GREATER_THAN_OR_EQUAL,
      value: 80,
    },
    {
      property: StudentSegmentProperty.JOURNEY_STAGE,
      operator: SegmentOperator.IS_ANY_OF,
      value: [JourneyStage.QUALIFIED],
    },
    {
      property: StudentSegmentProperty.PROGRAM_INTEREST,
      operator: SegmentOperator.IS_ANY_OF,
      value: ["SOFTWARE_ENGINEERING"],
    },
  ],
};
```

Hiển thị:

```text
Điểm Lead >= 80
AND
Trạng thái Lead là một trong [Đủ điều kiện]
AND
Ngành quan tâm là một trong [Software Engineering]
```
