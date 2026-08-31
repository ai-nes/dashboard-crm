# Thứ tự gọi Component — Trang School Detail

**Route:** `src/app/(with-layouts)/(dashboard)/director/schools/[schoolCode]/page.tsx`

## 1. Entry point

```
SchoolDetailPage (page.tsx)
  ├─ getSchoolById(schoolCode)          // src/services/api/schools/school-directory
  ├─ buildSchoolIntelligence(school)    // ../_components/mock-data
  └─ <SchoolIntelligenceDashboard data={...} />
```

## 2. `SchoolIntelligenceDashboard` — thứ tự render component con

File: `_components/school-intelligence-dashboard.tsx`

| # | Component | File |
|---|-----------|------|
| 1 | `SchoolHeader` | `school-header.tsx` |
| 2 | `SchoolPotentialBreakdown` | `school-potential-breakdown.tsx` |
| 3 | `SchoolActionPlan` | `school-action-plan.tsx` |
| 4 | `SchoolLocalityCard` | `school-locality-card.tsx` |
| 5 | `SchoolOutcomes` | `school-outcomes.tsx` |
| 6 | `SchoolAcademicProfile` | `school-academic-profile.tsx` |
| 7 | `SchoolRelationshipCard` | `school-relationship-card.tsx` |
| 8 | `ActivityTimeline` | `activity-timeline.tsx` |
| 9 | `SchoolPotentialDecomposition` | `school-potential-decomposition.tsx` |

Layout:

```tsx
<main>
  <SchoolHeader data={data} />

  <section className="grid xl:grid-cols-[1.16fr_0.84fr]">
    <SchoolPotentialBreakdown data={data} />
    <SchoolActionPlan data={data} />
  </section>

  <SchoolLocalityCard data={data} />
  <SchoolOutcomes data={data} />
  <SchoolAcademicProfile data={data} />
  <SchoolRelationshipCard data={data} />
  <ActivityTimeline data={data} />
  <SchoolPotentialDecomposition data={data} />
</main>
```

## 3. Component con cấp sâu hơn

### `SchoolLocalityCard` (mục 4)

```
SchoolLocalityCard
  ├─ getSchoolLocalityContext(school)     // school-locality-data.ts
  └─ SchoolLocalityMap (lazy-loaded)      // school-locality-map-loader.tsx → school-locality-map.tsx
```

Tất cả các component còn lại (`SchoolHeader`, `SchoolPotentialBreakdown`, `SchoolActionPlan`, `SchoolOutcomes`, `SchoolAcademicProfile`, `SchoolRelationshipCard`, `ActivityTimeline`) đều nhận chung một prop `data: SchoolIntelligenceData` và tự render nội dung riêng, không gọi lẫn nhau.

## 4. Nguồn dữ liệu dùng chung

- Kiểu dữ liệu: `SchoolIntelligenceData` từ `src/services/api/schools/types.ts`
- Mock builder: `buildSchoolIntelligence()` trong `_components/mock-data.ts`
