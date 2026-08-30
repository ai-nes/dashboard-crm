# Mock API

Các service trong `src/services/api` đọc fixture từ `mock-data.json`. Route dưới đây dùng lại chính các service đó để tạo response HTTP mà không cần backend riêng:

```text
GET /api/mock/{domain}/{resource}
```

Ví dụ:

```text
/api/mock/ai/cost-analytics?granularity=monthly
/api/mock/crm/lead-growth?granularity=30d
/api/mock/marketing/campaign-visitors?period=90d
/api/mock/stocks/portfolio-performance?range=1Y
```

Các endpoint gợi ý:

```text
GET /api/mock/students/suggestions?q=nguyen&limit=8
GET /api/mock/schools/suggestions?q=amsterdam&limit=8
```

Danh sách chính:

- `ai`: `cost-analytics`, `weekly-activity`, `top-usage`, `agents`, `recent-activities`, `provider-distribution`
- `analytics`: `visitors`, `used-devices`, `top-countries`, `top-content`, `top-channels`
- `campaign-intelligence`: resource tổng hợp
- `crm`: `lead-growth`, `leads-report`, `upcoming-tasks`, `recent-activities`
- `home`: `overview-stats`, `sales-chart`, `inventory-overview`, `top-products`, `traffic-sources`, `last-transactions`
- `marketing`: `overview-stats`, `campaign-visitors`, `audience-insights`, `conversion-funnel`, `channel-performance`, `recent-activities`
- `saas`: `revenue-overview`, `customer-growth`, `plan-mix`, `recent-signups`, `recent-activities`
- `stocks`: `portfolio-performance`, `watchlist`, `exchange`, `market-overview`, `last-transactions`, `market-news`
- `students`: danh sách, `/{studentId}` cho Student 360, `/suggestions`
- `schools`: danh sách, `/{schoolId}`, `/report`, `/suggestions`

Khi kết nối backend thật, có thể giữ nguyên response contract và thay phần adapter trong `src/services/api/*/data.ts` bằng client gọi HTTP.
