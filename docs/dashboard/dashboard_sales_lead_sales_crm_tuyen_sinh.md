# Đặc tả Dashboard Sales & Lead Sales cho CRM Tuyển sinh

> Phạm vi tài liệu: Dashboard dành cho **Sales** và **Lead Sales** trong quy trình tuyển sinh.  
> Không sử dụng KPI doanh thu, học phí, revenue hoặc giá trị tiền tệ.  
> Trọng tâm: **Target nhập học → Pipeline → Conversion → Action → Pipeline Health → Team Performance**.

---

## 1. Mục tiêu của dashboard

Dashboard không chỉ để “xem số”, mà phải giúp từng vai trò trả lời nhanh câu hỏi nghiệp vụ.

### 1.1. Sales cần trả lời được

1. Tôi đã đạt bao nhiêu chỉ tiêu?
2. Tôi còn thiếu bao nhiêu Enrollment?
3. Pipeline hiện tại có đủ để đạt target không?
4. Học sinh/lead nào tôi phải xử lý hôm nay?
5. Có lead/opportunity nào đang bị bỏ quên hoặc đứng quá lâu không?
6. Tôi đang mất học sinh ở stage nào?
7. Tỷ lệ chuyển đổi của tôi đang tốt hay kém ở bước nào?

### 1.2. Lead Sales cần trả lời được

1. Team đã đạt bao nhiêu target?
2. Với pipeline hiện tại, team có khả năng đạt target không?
3. Team đang nghẽn ở stage nào?
4. Sales nào thiếu pipeline?
5. Sales nào có nhiều follow-up quá hạn?
6. Sales nào có conversion thấp?
7. Pipeline của team đang tăng hay cạn?
8. Lead/opportunity đang bị tồn ở đâu?
9. Cần điều phối lead hoặc hỗ trợ Sales nào?

---

# 2. Luồng nghiệp vụ chuẩn

Luồng nghiệp vụ dashboard nên bám theo vòng đời tuyển sinh.

```text
Lead mới
   ↓
Đã liên hệ
   ↓
Đủ điều kiện / Qualified
   ↓
Đang tư vấn
   ↓
Opportunity
   ↓
Application / Hồ sơ
   ↓
Confirmed / Xác nhận
   ↓
Enrollment / Nhập học
```

Tên stage thực tế có thể khác tùy hệ thống, nhưng khi tính KPI cần chuẩn hóa về các nhóm logic trên.

---

# 3. Bộ 12 KPI lõi cho dashboard chính

Đây là bộ KPI nên xuất hiện trên dashboard chính. Các chỉ số khác nên đặt ở drill-down hoặc report chi tiết.

| # | KPI | Nhóm | Sales dùng để làm gì | Lead Sales dùng để làm gì |
|---:|---|---|---|---|
| 1 | Enrollment | Result | Biết số HS đã nhập học của mình | Biết kết quả toàn team và từng Sales |
| 2 | Target Achievement | Target | Biết % hoàn thành target cá nhân | Biết team/Sales nào đang chậm target |
| 3 | Target Remaining | Target | Biết còn thiếu bao nhiêu Enrollment | Biết team còn thiếu bao nhiêu |
| 4 | Expected Enrollment | Forecast | Biết pipeline hiện tại dự kiến mang về bao nhiêu Enrollment | Dự báo khả năng đạt target của team |
| 5 | Pipeline Coverage | Forecast | Biết pipeline hiện tại có đủ đạt target không | Tìm Sales/team đang thiếu pipeline |
| 6 | Open Opportunities | Pipeline | Biết bao nhiêu HS đang có khả năng chuyển đổi | Theo dõi quy mô pipeline |
| 7 | New Opportunities | Pipeline | Biết pipeline mới có đang được bổ sung | Biết team đang tạo thêm pipeline hay đang cạn |
| 8 | Stage Volume / Funnel | Pipeline | Biết HS đang tập trung ở stage nào | Tìm stage bị dồn hoặc nghẽn |
| 9 | Stage Conversion Rate | Conversion | Biết mình yếu ở bước nào | Tìm bottleneck của team hoặc từng Sales |
| 10 | Win / Enrollment Rate | Conversion | Biết khả năng chốt Opportunity → Enrollment | So sánh conversion giữa Sales/team |
| 11 | Follow-up Due / Overdue | Action | Biết hôm nay phải xử lý ai | Phát hiện backlog / Sales quá tải / bỏ sót |
| 12 | Lead / Stage Aging | Health | Ưu tiên case bị đứng lâu | Tìm pipeline đang tắc theo Sales/stage |

---

# 4. Định nghĩa chi tiết từng KPI

## 4.1. Enrollment

### Ý nghĩa

Số lượng học sinh đã đạt trạng thái nhập học thành công trong kỳ đang xem.

### Công thức

```text
Enrollment
= COUNT(record có final_stage = "Enrollment")
```

### Điều kiện tính

- Chỉ tính record đã đạt trạng thái Enrollment hợp lệ.
- Không tính record bị cancel sau Enrollment nếu nghiệp vụ có trạng thái hủy.
- Phải lọc theo kỳ tuyển sinh hoặc khoảng thời gian đang xem.
- Với Sales: lọc theo owner/sales phụ trách.
- Với Lead Sales: tính toàn team và có thể drill-down từng Sales.

### Nguồn dữ liệu

Ưu tiên:

```text
Enrollment / Admission / Student Applicant
```

hoặc record cuối của pipeline nếu hệ thống chưa có bảng Enrollment riêng.

Các field tối thiểu cần có:

```text
id
lead_id / student_id
owner
team
stage
enrollment_date
admission_period
program
region
status
```

### UI

KPI Card:

```text
Enrollment
63
+8 so với kỳ trước
```

Sales:

```text
My Enrollment
13
```

Lead Sales:

```text
Team Enrollment
63
```

### Khi click

Drill-down danh sách Enrollment theo:

- Sales
- Program
- Lead Source
- Region
- Date
- Admission Period

---

## 4.2. Target Achievement

### Ý nghĩa

Phần trăm chỉ tiêu Enrollment đã hoàn thành.

### Công thức

```text
Target Achievement
= Enrollment / Enrollment Target × 100%
```

### Ví dụ

```text
Enrollment = 13
Target = 20

Target Achievement = 13 / 20 × 100 = 65%
```

### Trường hợp đặc biệt

Nếu Target = 0:

```text
Target Achievement = N/A
```

Không nên hiển thị 0% vì dễ hiểu sai.

### Nguồn dữ liệu

- Enrollment: từ dữ liệu tuyển sinh.
- Target: từ bảng Target/Quota.

Bảng Target nên có:

```text
target_id
target_type          # individual / team
sales_id
team_id
period
target_enrollment
start_date
end_date
```

### UI

```text
Target Achievement
65%
13 / 20
```

Nên kèm progress bar.

### Logic màu

Ví dụ:

- >= 100%: success
- 80–99%: on track
- 60–79%: warning
- < 60%: risk

Lưu ý: threshold nên cấu hình theo business, không hard-code.

---

## 4.3. Target Remaining

### Ý nghĩa

Số Enrollment còn thiếu để hoàn thành target.

### Công thức

```text
Target Remaining
= MAX(Target - Enrollment, 0)
```

### Ví dụ

```text
Target = 20
Enrollment = 13
Remaining = 7
```

Nếu Enrollment = 23:

```text
Remaining = 0
```

Có thể hiển thị thêm:

```text
Exceeded Target = +3
```

nhưng không trừ thành số âm.

### Nguồn dữ liệu

- Target
- Enrollment

### UI

```text
Remaining
7 students
```

### Tác dụng

Đây là denominator quan trọng để tính Pipeline Coverage.

---

## 4.4. Expected Enrollment

### Ý nghĩa

Số Enrollment dự kiến có thể tạo ra từ pipeline hiện tại.

Đây là chỉ số forecast, không phải kết quả thực tế.

### Cách tính khuyến nghị

```text
Expected Enrollment
= Σ(Open record × Probability của stage)
```

Ví dụ:

| Stage | Số HS | Probability | Expected |
|---|---:|---:|---:|
| Qualified | 100 | 10% | 10 |
| Consultation | 80 | 25% | 20 |
| Opportunity | 50 | 50% | 25 |
| Application | 30 | 75% | 22.5 |
| Confirmed | 15 | 95% | 14.25 |

```text
Expected Enrollment = 91.75 ≈ 92
```

### Cách xác định Probability

Có 2 lựa chọn.

#### Cách A — Config cố định

Admin cấu hình:

```text
Qualified       = 10%
Consultation    = 25%
Opportunity     = 50%
Application     = 75%
Confirmed       = 95%
```

Ưu điểm:

- Dễ triển khai.
- Dễ giải thích.

Nhược điểm:

- Có thể không phản ánh dữ liệu thực tế.

#### Cách B — Tính từ lịch sử

```text
Probability(stage)
= Số record lịch sử từ stage đó cuối cùng Enrollment
  / Tổng số record từng đi qua stage đó
```

Ví dụ:

```text
1,000 Opportunity lịch sử
420 cuối cùng Enrollment

Probability Opportunity = 42%
```

Khuyến nghị lâu dài: dùng dữ liệu lịch sử.

### Nguồn dữ liệu

- Pipeline / Opportunity
- Stage History
- Historical Enrollment
- Stage Probability Configuration

### UI

```text
Expected Enrollment
41
```

Tooltip:

```text
Ước tính dựa trên số hồ sơ hiện tại và xác suất chuyển đổi của từng stage.
```

### Không nên

Không hiển thị Expected Enrollment như số chắc chắn.

---

## 4.5. Pipeline Coverage

### Ý nghĩa

Đo mức độ pipeline dự kiến có đủ để bù phần target còn thiếu hay không.

### Công thức

```text
Pipeline Coverage
= Expected Enrollment / Target Remaining
```

### Ví dụ

```text
Expected Enrollment = 9
Target Remaining = 7

Coverage = 1.29x
```

### Diễn giải

```text
< 1.0x  → pipeline hiện tại chưa đủ
= 1.0x  → vừa đủ theo forecast
> 1.0x  → có buffer
```

### Trường hợp Target Remaining = 0

Hiển thị:

```text
Target achieved
```

Không chia cho 0.

### Nguồn dữ liệu

- Expected Enrollment
- Target Remaining

### UI

```text
Pipeline Coverage
1.29x
```

Có thể kèm trạng thái:

```text
Healthy
At Risk
Insufficient
```

Các nhãn phải dựa trên threshold business cấu hình.

---

## 4.6. Open Opportunities

### Ý nghĩa

Số lượng Opportunity đang mở và chưa kết thúc.

### Công thức

```text
Open Opportunities
= COUNT(Opportunity WHERE status = Open)
```

Hoặc:

```text
stage ∈ các stage đang active
AND status NOT IN (Won, Lost, Cancelled)
```

### Nguồn dữ liệu

Opportunity / pipeline record.

Field cần có:

```text
opportunity_id
lead_id
owner
stage
status
created_at
updated_at
next_follow_up
program
source
region
```

### UI

```text
Open Opportunities
18
```

Nên có secondary text:

```text
5 new this week
```

### Khi click

Mở danh sách opportunity với các cột:

```text
Student
Stage
Owner
Last Activity
Next Follow-up
Age
Program
Source
```

---

## 4.7. New Opportunities

### Ý nghĩa

Số Opportunity mới được tạo trong khoảng thời gian đang xem.

### Công thức

```text
New Opportunities
= COUNT(Opportunity WHERE created_at ∈ selected period)
```

### Không nhầm với

```text
New Lead
```

New Lead = lead mới vào hệ thống.

New Opportunity = lead đã đạt điều kiện chuyển thành opportunity.

### Nguồn dữ liệu

Opportunity.created_at

### UI

```text
New Opportunities
5
+2 vs previous period
```

### Lead Sales dùng để phát hiện

- Pipeline đang tăng.
- Pipeline đang cạn.
- Sales có đang tạo thêm opportunity không.

---

## 4.8. Stage Volume / Funnel

### Ý nghĩa

Số lượng record đang nằm ở từng stage.

### Công thức

```text
Stage Volume(stage)
= COUNT(active pipeline record WHERE current_stage = stage)
```

### UI

Dùng funnel hoặc horizontal stage flow.

Ví dụ:

```text
Lead             500
 ↓
Contacted        420
 ↓
Qualified        280
 ↓
Opportunity      160
 ↓
Application       90
 ↓
Enrollment        63
```

### Không nên

Không dùng 6 KPI card riêng.

### Nguồn dữ liệu

Current stage từ:

- Lead
- Opportunity
- Application
- Enrollment

Hoặc một bảng pipeline chuẩn hóa.

### Drill-down

Click stage để xem danh sách record đang nằm trong stage đó.

---

## 4.9. Stage Conversion Rate

### Ý nghĩa

Tỷ lệ chuyển đổi từ một stage sang stage tiếp theo.

### Công thức cơ bản

```text
Stage Conversion A → B
= Số record chuyển từ A sang B
  / Số record đã vào A
  × 100%
```

### Ví dụ

```text
Qualified = 280
Opportunity = 160

Qualified → Opportunity
= 160 / 280
= 57.1%
```

### Cách tính chính xác hơn

Nên dựa trên Stage History thay vì snapshot hiện tại.

Ví dụ:

```text
COUNT(distinct lead đi từ Qualified → Opportunity trong period)
/
COUNT(distinct lead từng vào Qualified trong cohort)
```

### Vì sao cần cohort

Nếu lấy snapshot hiện tại:

- Lead mới vào Qualified hôm nay chưa có thời gian chuyển stage.
- Có thể làm conversion thấp giả.

Khuyến nghị:

- Cho dashboard realtime: có thể dùng snapshot đơn giản.
- Cho report chính xác: dùng cohort hoặc stage history.

### Nguồn dữ liệu

Stage History:

```text
record_id
from_stage
to_stage
changed_at
owner
```

### UI

Trong funnel:

```text
Qualified
280
   ↓ 57%

Opportunity
160
```

---

## 4.10. Win / Enrollment Rate

### Ý nghĩa

Tỷ lệ Opportunity cuối cùng chuyển thành Enrollment.

### Công thức khuyến nghị

```text
Enrollment Rate
= Enrollment
  / Closed Opportunities
  × 100%
```

Trong đó:

```text
Closed Opportunities
= Enrollment + Lost
```

### Hoặc nếu business muốn

```text
Enrollment / Total Opportunity
```

Nhưng phải chọn duy nhất một định nghĩa và dùng nhất quán.

### Khuyến nghị

Dùng:

```text
Enrollment / (Enrollment + Lost)
```

vì chỉ tính những Opportunity đã có kết quả.

### Nguồn dữ liệu

Opportunity status + Enrollment outcome.

### UI

```text
Enrollment Rate
35%
```

Lead Sales drill-down:

```text
Team       35%
Sale A     43%
Sale B     21%
Sale C     36%
```

---

## 4.11. Follow-up Due / Overdue

### Ý nghĩa

Đây là nhóm KPI hành động quan trọng nhất với Sales.

### Follow-up Due

```text
Follow-up Due
= COUNT(active record WHERE next_follow_up_date = today)
```

### Overdue

```text
Overdue
= COUNT(
    active record
    WHERE next_follow_up_date < now
    AND follow_up chưa hoàn thành
)
```

### Nguồn dữ liệu

Có thể lấy từ:

- Task
- ToDo
- Next Action
- Follow-up
- Activity Scheduler

Field cần có:

```text
reference_id
owner
due_at
status
activity_type
completed_at
```

### UI

Nên hiển thị thành Action Panel, không chỉ KPI.

Ví dụ:

```text
Today's Actions

12 Follow-up Due
4 Overdue

[Student A] Call today
[Student B] Follow-up overdue 2 days
[Student C] Consultation at 14:00
```

### Logic ưu tiên

Sắp xếp:

1. Overdue lâu nhất
2. High priority / Hot lead
3. Due today sớm nhất
4. Opportunity stage gần Enrollment
5. Các task thường

---

## 4.12. Lead / Stage Aging

### Ý nghĩa

Số ngày record nằm tại stage hiện tại mà chưa tiến triển.

### Công thức

```text
Stage Aging
= NOW - current_stage_entered_at
```

### Lead Aging

Nếu lead chưa vào Opportunity:

```text
Lead Aging
= NOW - lead_created_at
```

hoặc:

```text
NOW - last_stage_change_at
```

tùy định nghĩa business.

### Nguồn dữ liệu

- Lead.created_at
- Stage History
- current_stage_entered_at

### UI

```text
Aging
3 records > 5 days
```

Nên chia bucket:

```text
0–2 days
3–5 days
6–10 days
>10 days
```

### Lead Sales dùng để

- Tìm pipeline bị tắc.
- Phát hiện Sales bỏ quên.
- Xác định stage mất nhiều thời gian.

---

# 5. Các KPI phụ nên có ở drill-down

Không nhất thiết đặt trên dashboard chính nhưng nên có trong report hoặc detail page.

| KPI | Ý nghĩa |
|---|---|
| New Leads | Lead mới vào hệ thống |
| Uncontacted Leads | Lead chưa có lần liên hệ đầu tiên |
| First Response Time | Thời gian từ lúc nhận Lead đến lần contact đầu |
| Sales Cycle | Thời gian Lead → Enrollment |
| Activity Count | Call / message / consultation / follow-up |
| Activity Conversion | Activity tạo chuyển stage |
| Lost Rate | Tỷ lệ Lost |
| Lost Reason | Nguyên nhân không tiếp tục |
| Reassignment Count | Số lead bị chuyển owner |
| No Activity Count | Lead không có activity trong X ngày |
| SLA Breach | Lead vi phạm SLA |
| Contact Rate | Lead → Contacted |
| Qualification Rate | Contacted → Qualified |
| Application Conversion | Opportunity → Application |

---

# 6. Dashboard Sales — UI đề xuất

## 6.1. Mục tiêu UI

Sales mở dashboard phải hiểu được trong 5–10 giây:

```text
Tôi đã đạt bao nhiêu?
Tôi còn thiếu bao nhiêu?
Pipeline có đủ không?
Hôm nay cần xử lý ai?
Case nào đang có nguy cơ bị mất?
```

---

## 6.2. Layout tổng thể

```text
┌─────────────────────────────────────────────────────────────┐
│ FILTER: Period | Program | Source | Region                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬──────────────┬───────────────┐
│ Enrollment  │ Achievement │ Remaining    │ Expected      │
│ 13          │ 65%         │ 7            │ 9             │
└─────────────┴─────────────┴──────────────┴───────────────┘

┌───────────────────┬─────────────────────────────────────────┐
│ Pipeline Coverage │ Open Opportunities                     │
│ 1.29x             │ 18 | +5 New                            │
└───────────────────┴─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MY FUNNEL                                                   │
│ Lead → Contacted → Qualified → Opportunity → App → Enroll  │
│          conversion % giữa các stage                        │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────┬────────────────────────────────┐
│ TODAY'S ACTIONS            │ PIPELINE HEALTH                │
│ 12 Follow-up Due           │ 3 Aging > 5 days              │
│ 4 Overdue                  │ 2 No activity > 3 days        │
│ action list                │ aging list                     │
└────────────────────────────┴────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MY CONVERSION                                               │
│ Stage Conversion | Enrollment Rate | Sales Cycle            │
└─────────────────────────────────────────────────────────────┘
```

---

# 7. Logic hiển thị Dashboard Sales

## 7.1. Scope mặc định

Sales chỉ thấy:

```text
owner = current_user
```

Không xem số liệu cá nhân của Sales khác trừ khi business cho phép.

## 7.2. Period mặc định

Khuyến nghị:

```text
Current Admission Period
```

hoặc:

```text
This Month
```

Tùy mô hình target.

Nếu target theo kỳ tuyển sinh, ưu tiên kỳ tuyển sinh.

## 7.3. Ưu tiên khu vực

Thứ tự:

1. Result
2. Forecast
3. Action
4. Pipeline
5. Conversion
6. Health

Lý do: Sales cần hành động trước, không cần phân tích team.

## 7.4. Empty state

Ví dụ không có Opportunity:

```text
No open opportunities
Your current pipeline is empty.
Review new leads or assigned leads.
```

Không hiển thị `0` mà không giải thích.

## 7.5. Warning logic

Ví dụ:

```text
Pipeline Coverage < configured threshold
→ show "Pipeline insufficient"

Overdue > 0
→ show attention state

Aging > stage SLA
→ show warning

Target Remaining > Expected Enrollment
→ show gap warning
```

---

# 8. Dashboard Lead Sales — UI đề xuất

## 8.1. Mục tiêu UI

Lead Sales cần nhìn:

```text
Team có đạt target không?
Nếu không thì tại sao?
Nghẽn ở stage nào?
Sales nào có vấn đề?
Cần can thiệp vào đâu?
```

---

## 8.2. Layout tổng thể

```text
┌──────────────────────────────────────────────────────────────┐
│ FILTER: Period | Team | Sales | Program | Source | Region   │
└──────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬──────────────┬───────────────┐
│ Enrollment  │ Achievement │ Remaining    │ Expected      │
│ 63          │ 63%         │ 37           │ 41            │
└─────────────┴─────────────┴──────────────┴───────────────┘

┌────────────────────┬─────────────────────────────────────────┐
│ Pipeline Coverage  │ Open Opportunities                     │
│ 1.11x              │ 160 | +35 New                         │
└────────────────────┴─────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TEAM FUNNEL                                                  │
│ Lead → Contacted → Qualified → Opportunity → App → Enroll   │
│ volume + conversion rate                                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬────────────────────────────────┐
│ PIPELINE HEALTH             │ ACTION / EXCEPTIONS            │
│ Aging by stage              │ Overdue by Sales               │
│ Stalled opportunities       │ Uncontacted leads              │
│ Coverage risk               │ SLA breach                     │
└─────────────────────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ REP PERFORMANCE                                              │
│ Sales | Target | Enrollment | Expected | Coverage | Win Rate│
│       | Overdue | Aging                                       │
└──────────────────────────────────────────────────────────────┘
```

---

# 9. Logic hiển thị Dashboard Lead Sales

## 9.1. Scope mặc định

```text
team_id IN teams_managed_by(current_user)
```

Nếu Lead Sales chỉ quản lý một team:

```text
team_id = current_user.team
```

## 9.2. Drill-down

Mọi KPI team cần có khả năng drill xuống:

```text
Team
  ↓
Sales
  ↓
Student / Lead / Opportunity
```

Ví dụ:

```text
Overdue = 31

click
↓
Sale A = 2
Sale B = 14
Sale C = 5
Sale D = 10

click Sale B
↓
danh sách 14 record overdue
```

## 9.3. Exception-first

Lead Sales nên được ưu tiên thấy exception.

Ví dụ:

```text
Need Attention

Sale B
Pipeline Coverage: 0.62x

Sale D
14 overdue follow-ups

Opportunity stage
Average aging: 8.7 days

Application → Enrollment
Conversion dropped to 38%
```

Không nhất thiết tạo thêm KPI; đây là rule phát hiện bất thường từ KPI hiện có.

---

# 10. Bảng Rep Performance cho Lead Sales

Không dùng "Rep Performance" như một KPI card.

Nó nên là bảng tổng hợp.

| Sales | Target | Enrollment | Achievement | Remaining | Expected | Coverage | Open Opp | Win Rate | Overdue | Aging |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Sale A | 20 | 16 | 80% | 4 | 6 | 1.50x | 18 | 43% | 2 | 1 |
| Sale B | 20 | 11 | 55% | 9 | 5 | 0.56x | 15 | 21% | 9 | 7 |
| Sale C | 20 | 18 | 90% | 2 | 4 | 2.00x | 12 | 41% | 1 | 0 |

### Sắp xếp mặc định

Không nên rank Sales kiểu "best/worst" cứng.

Nên cho sort theo:

- Target Achievement
- Remaining
- Coverage
- Win Rate
- Overdue
- Aging

### Highlight logic

Ví dụ:

```text
Coverage < 1.0x → highlight risk
Overdue > configured threshold → warning
Aging > SLA → warning
Achievement thấp hơn plan → warning
```

---

# 11. Bộ filter đa chiều

12 KPI chỉ thực sự có giá trị khi có dimension để drill-down.

Khuyến nghị tối thiểu 6 dimension.

| Dimension | Ví dụ | Dùng để trả lời |
|---|---|---|
| Time | Day / Week / Month / Admission Period | Khi nào hiệu suất tăng/giảm? |
| Sales / Team | Sales A / Team 1 | Ai đang có vấn đề? |
| Lead Source | Facebook / Website / Referral / Event | Nguồn nào convert tốt? |
| Program | CNTT / Marketing / Cơ khí | Ngành nào mạnh/yếu? |
| Region | HCM / Hà Nội / miền / tỉnh | Khu vực nào có pipeline tốt? |
| Stage | Qualified / Opportunity / Application | Pipeline nghẽn ở đâu? |

Có thể bổ sung:

```text
Campus
Channel
Student Type
Campaign
Admission Batch
Counselor
```

nếu business có dữ liệu.

---

# 12. Logic filter

## 12.1. Filter toàn trang

Filter toàn trang nên áp dụng đồng nhất cho tất cả widget.

Ví dụ:

```text
Period = Sep 2026
Program = IT
Region = HCM
```

Tất cả:

- Enrollment
- Target
- Pipeline
- Conversion
- Follow-up
- Aging

phải cùng scope.

## 12.2. Target và filter

Cẩn thận khi filter Target.

Ví dụ nếu filter Program = IT nhưng target chỉ được giao theo Sales tổng, không có target theo Program:

Không được tự chia target.

Nên hiển thị:

```text
Target not available for this breakdown
```

hoặc target tổng nhưng phải ghi rõ scope.

## 12.3. Date semantics

Mỗi KPI phải xác định rõ field date dùng để filter.

Ví dụ:

| KPI | Date dùng |
|---|---|
| Enrollment | enrollment_date |
| New Opportunities | opportunity.created_at |
| Follow-up | due_at |
| Stage Conversion | stage_changed_at |
| Aging | snapshot hiện tại |
| Open Opportunities | active as of now |
| Target | target period |

---

# 13. Data model tối thiểu cần có

Không bắt buộc đúng tên bảng bên dưới, nhưng hệ thống cần có dữ liệu tương đương.

## 13.1. Lead

```text
lead_id
student_id
owner
team_id
source
program
region
status
created_at
first_contact_at
last_activity_at
current_stage
current_stage_entered_at
```

## 13.2. Opportunity

```text
opportunity_id
lead_id
owner
team_id
stage
status
created_at
updated_at
closed_at
lost_reason
next_follow_up_at
program
source
region
```

## 13.3. Stage History

Rất quan trọng.

```text
history_id
record_id
record_type
from_stage
to_stage
changed_at
changed_by
owner_at_time
```

Dùng để tính:

- Stage Conversion
- Stage Aging
- Sales Cycle
- Funnel history
- Cohort conversion

## 13.4. Activity

```text
activity_id
reference_id
activity_type
owner
created_at
completed_at
status
channel
```

Ví dụ:

```text
Call
Message
Consultation
Email
Meeting
Follow-up
```

## 13.5. Follow-up / Task

```text
task_id
reference_id
owner
due_at
status
completed_at
priority
```

## 13.6. Enrollment

```text
enrollment_id
lead_id
opportunity_id
owner
team_id
enrollment_date
program
region
admission_period
status
```

## 13.7. Target

```text
target_id
target_type
sales_id
team_id
start_date
end_date
admission_period
target_enrollment
```

## 13.8. Stage Configuration

```text
stage_code
stage_name
stage_order
is_open_stage
is_closed_stage
is_enrollment_stage
default_probability
aging_sla_days
```

---

# 14. Mapping KPI → nguồn dữ liệu

| KPI | Nguồn chính | Field chính |
|---|---|---|
| Enrollment | Enrollment | enrollment_date, owner, status |
| Target Achievement | Enrollment + Target | enrollment count, target_enrollment |
| Target Remaining | Enrollment + Target | target - enrollment |
| Expected Enrollment | Opportunity + Stage Config/History | stage, probability |
| Pipeline Coverage | Expected + Target Remaining | calculated |
| Open Opportunities | Opportunity | status, stage |
| New Opportunities | Opportunity | created_at |
| Stage Volume | Lead/Opportunity/Pipeline | current_stage |
| Stage Conversion | Stage History | from_stage, to_stage |
| Win Rate | Opportunity + Enrollment/Lost | closed outcome |
| Follow-up Due | Task/Follow-up | due_at, status |
| Overdue | Task/Follow-up | due_at < now |
| Lead Aging | Lead | created_at / stage_entered_at |
| Stage Aging | Stage History/Pipeline | current_stage_entered_at |

---

# 15. Chuẩn định nghĩa thời gian

Phải thống nhất timezone của CRM.

Khuyến nghị:

```text
Database timestamps: UTC
Display timezone: configured organization timezone
```

Ví dụ VN:

```text
Asia/Ho_Chi_Minh
```

"Today" của follow-up phải tính theo timezone organization/user, không lấy UTC trực tiếp.

---

# 16. Xử lý ownership

Một vấn đề quan trọng là lead có thể đổi Sales.

Có 2 cách tính.

## 16.1. Current Owner Attribution

Enrollment được tính cho Sales đang là owner tại thời điểm hiện tại.

Dễ làm nhưng có thể sai lịch sử.

## 16.2. Outcome Owner Attribution

Enrollment tính cho Sales chịu trách nhiệm tại thời điểm Enrollment.

Khuyến nghị dùng cách này.

Nên lưu:

```text
owner_at_enrollment
```

hoặc lấy từ stage history.

### Dashboard hiện tại

Open pipeline:

```text
current owner
```

### Historical performance

Enrollment/Win Rate:

```text
owner at outcome
```

---

# 17. Xử lý duplicate Lead

Dashboard không nên double-count một học sinh do duplicate record.

Cần chọn key chuẩn:

```text
student_id
```

hoặc:

```text
canonical_lead_id
```

Nếu một học sinh có nhiều Opportunity khác nhau cho nhiều chương trình, cần business rule riêng.

Ví dụ:

- Funnel theo Opportunity → đếm opportunity.
- Enrollment → đếm student enrollment hợp lệ.
- Lead volume → đếm canonical lead.

Phải ghi rõ grain của từng KPI.

---

# 18. Grain của từng KPI

| KPI | Grain |
|---|---|
| Enrollment | Student / Enrollment |
| Target | Sales hoặc Team / Period |
| Open Opportunity | Opportunity |
| New Opportunity | Opportunity |
| Stage Volume | Pipeline record |
| Stage Conversion | Pipeline record transition |
| Follow-up | Task / Action |
| Aging | Lead hoặc Opportunity |
| Win Rate | Closed Opportunity |

Không được cộng các grain khác nhau mà không chuẩn hóa.

---

# 19. Refresh data

## Realtime hoặc gần realtime

Nên dùng cho:

- Follow-up Due
- Overdue
- Open Opportunities
- Stage Volume
- Aging
- Enrollment

## Có thể cache

- Stage Conversion
- Historical Win Rate
- Expected Enrollment
- Rep Performance

Ví dụ refresh:

```text
Operational KPI: realtime / 1–5 phút
Analytical KPI: 15–60 phút
Historical report: scheduled aggregation
```

Tùy hạ tầng.

---

# 20. UI component cho từng KPI

| KPI | UI phù hợp |
|---|---|
| Enrollment | KPI Card |
| Target Achievement | KPI Card + Progress |
| Target Remaining | KPI Card |
| Expected Enrollment | KPI Card |
| Pipeline Coverage | KPI Card / Gauge nhỏ |
| Open Opportunities | KPI Card |
| New Opportunities | Secondary metric |
| Stage Volume | Funnel |
| Stage Conversion | Funnel label / conversion chart |
| Win Rate | KPI + trend |
| Follow-up Due / Overdue | Action List |
| Lead / Stage Aging | Aging bucket + list |

Không nên biến mọi thứ thành card.

---

# 21. Hierarchy hiển thị

## Sales

```text
LEVEL 1 — What is my result?
Enrollment
Achievement
Remaining

LEVEL 2 — Can I hit target?
Expected Enrollment
Pipeline Coverage

LEVEL 3 — What should I do now?
Follow-up Due
Overdue

LEVEL 4 — What is in my pipeline?
Open Opportunities
New Opportunities
Funnel

LEVEL 5 — Where am I weak?
Stage Conversion
Win Rate
Aging
```

## Lead Sales

```text
LEVEL 1 — Is the team on track?
Enrollment
Achievement
Remaining
Expected
Coverage

LEVEL 2 — Where is the bottleneck?
Funnel
Stage Conversion
Aging

LEVEL 3 — Who needs attention?
Rep Performance
Overdue by Sales
Coverage by Sales

LEVEL 4 — What is changing?
New Opportunities
Pipeline trend
Conversion trend

LEVEL 5 — What cases need intervention?
Aging records
Overdue records
Stalled opportunities
```

---

# 22. Trạng thái và cảnh báo

Không nên chỉ tô màu theo số tuyệt đối.

Nên có threshold cấu hình.

Ví dụ Stage Aging:

```text
Qualified SLA = 3 days
Opportunity SLA = 5 days
Application SLA = 7 days
```

Logic:

```text
aging <= SLA
→ normal

aging > SLA
→ warning

aging > SLA × 2
→ critical
```

Follow-up:

```text
due_at > now
→ upcoming

due today
→ due

due_at < now
→ overdue
```

Coverage:

```text
coverage < minimum_coverage
→ risk
```

Threshold phải được cấu hình theo business.

---

# 23. Trend comparison

Các KPI sau nên có trend:

- Enrollment
- Achievement
- Expected Enrollment
- Open Opportunities
- New Opportunities
- Win Rate
- Stage Conversion

Ví dụ:

```text
Enrollment
63
↑ 12% vs previous period
```

Nhưng phải thống nhất comparison period:

```text
This month vs previous month
Current admission period vs previous equivalent period
```

Không trộn.

---

# 24. Drill-down chuẩn

Khi click KPI:

## Enrollment

```text
KPI
→ by Sales
→ by Program
→ by Source
→ record list
```

## Pipeline Coverage

```text
Coverage
→ Expected by stage
→ Expected by Sales
→ Opportunity list
```

## Stage Conversion

```text
Stage pair
→ by Sales
→ by Program / Source
→ transition records
```

## Overdue

```text
Total
→ by Sales
→ overdue list
→ open record
```

## Aging

```text
Aging bucket
→ by Stage
→ by Sales
→ record list
```

---

# 25. Search / table detail

Mọi list detail nên có:

```text
Student / Lead
Owner
Stage
Program
Source
Region
Last Activity
Next Follow-up
Stage Age
Priority
```

Action nhanh:

```text
Open profile
Call
Message
Create follow-up
Change stage
Assign/Reassign
```

Tùy quyền.

---

# 26. Logic phân quyền

## Sales

Có thể xem:

```text
My target
My leads
My opportunities
My activities
My follow-ups
My conversion
My enrollment
```

## Lead Sales

Có thể xem:

```text
Team target
All team pipeline
All team activities
Rep performance
Team conversion
Team aging
Team overdue
```

Có thể drill vào Sales thuộc team.

Không nên thấy team ngoài phạm vi quản lý nếu không có quyền.

---

# 27. Các chỉ số không nên đặt ở dashboard chính

Có thể có nhưng đưa vào Reports:

```text
Total calls
Total messages
Average call duration
Activity count
Campaign count
Lead reassignment
Detailed Lost Reason
Detailed Source attribution
Detailed SLA metrics
Historical cohort analysis
```

Lý do: tránh dashboard quá tải.

---

# 28. Điều kiện dữ liệu để KPI đáng tin

Trước khi build dashboard, phải đảm bảo:

1. Stage được chuẩn hóa.
2. Opportunity có owner.
3. Enrollment có ngày và owner.
4. Follow-up có due date.
5. Stage transition được lưu history.
6. Lead source được điền ổn định.
7. Program/Region được chuẩn hóa.
8. Lost phải có status rõ.
9. Target phải có period.
10. Duplicate lead phải được xử lý.

Nếu thiếu Stage History, một số KPI vẫn tính được nhưng độ chính xác giảm mạnh:

- Stage Conversion
- Stage Aging
- Sales Cycle
- Historical funnel

---

# 29. Data quality check

Nên có validation hoặc scheduled check:

```text
Opportunity không có owner
Lead không có source
Enrollment không có enrollment_date
Task overdue nhưng status completed
Current stage không khớp stage history
Duplicate student
Target overlapping period
Opportunity closed nhưng không có outcome
```

---

# 30. Công thức tổng hợp

```text
Enrollment
= count(valid enrolled students)

Target Achievement
= Enrollment / Target × 100

Target Remaining
= max(Target - Enrollment, 0)

Expected Enrollment
= Σ(open pipeline × stage probability)

Pipeline Coverage
= Expected Enrollment / Target Remaining

Open Opportunities
= count(open opportunities)

New Opportunities
= count(opportunities created in period)

Stage Volume
= count(records in each current stage)

Stage Conversion A→B
= transitioned A→B / records entering A

Enrollment Rate
= Enrollment / (Enrollment + Lost Opportunities)

Follow-up Due
= open tasks due today

Overdue
= open tasks where due_at < now

Stage Aging
= now - current_stage_entered_at
```

---

# 31. Ví dụ hoàn chỉnh — Sales

Giả sử Sales A:

```text
Target = 20
Enrollment = 13
Expected Enrollment = 9
Open Opportunities = 18
New Opportunities = 5
Follow-up Due = 12
Overdue = 4
Aging > SLA = 3
```

Tính:

```text
Target Achievement
= 13 / 20
= 65%

Target Remaining
= 20 - 13
= 7

Pipeline Coverage
= 9 / 7
= 1.29x
```

Dashboard có thể diễn giải:

```text
You have enrolled 13 of 20 students.
7 enrollments remain.

Current pipeline is expected to generate 9 enrollments.
Pipeline coverage: 1.29x.

Today:
12 follow-ups due
4 overdue
3 records are aging beyond SLA
```

---

# 32. Ví dụ hoàn chỉnh — Lead Sales

Giả sử team:

```text
Target = 100
Enrollment = 63
Expected Enrollment = 41
Open Opportunities = 160
New Opportunities = 35
Overdue = 31
```

Tính:

```text
Achievement
= 63%

Remaining
= 37

Coverage
= 41 / 37
= 1.11x
```

Sau đó drill-down:

| Sales | Remaining | Expected | Coverage | Win Rate | Overdue |
|---|---:|---:|---:|---:|---:|
| A | 4 | 6 | 1.50x | 43% | 2 |
| B | 9 | 5 | 0.56x | 21% | 9 |
| C | 2 | 4 | 2.00x | 41% | 1 |

Lead Sales có thể thấy ngay:

- Sales B có Coverage thấp.
- Sales B có Overdue cao.
- Có thể drill-down vào pipeline của Sales B.

Dashboard chỉ cung cấp tín hiệu; quyết định điều phối là của Lead Sales.

---

# 33. Kiến trúc dashboard khuyến nghị

## Sales Dashboard

```text
[ Global Filters ]

[ Enrollment ]
[ Achievement ]
[ Remaining ]
[ Expected ]
[ Coverage ]

[ Open Opportunities | New Opportunities ]

[ Funnel + Stage Conversion ]

[ Today's Actions ]
[ Pipeline Health ]

[ Enrollment Rate / Conversion Trends ]
```

## Lead Sales Dashboard

```text
[ Global Filters ]

[ Team Enrollment ]
[ Team Achievement ]
[ Remaining ]
[ Expected ]
[ Coverage ]

[ Team Funnel + Stage Conversion ]

[ Pipeline Health ]
[ Exceptions / Need Attention ]

[ Rep Performance Table ]

[ Trends / Source / Program / Region drill-down ]
```

---

# 34. Kết luận thiết kế

Dashboard chính không nên cố hiển thị 20–30 KPI.

Cấu trúc khuyến nghị là:

```text
12 Core KPI
+
6 Dimension chính
+
Drill-down
+
Exception detection
```

12 KPI lõi:

```text
1. Enrollment
2. Target Achievement
3. Target Remaining
4. Expected Enrollment
5. Pipeline Coverage
6. Open Opportunities
7. New Opportunities
8. Stage Volume / Funnel
9. Stage Conversion Rate
10. Win / Enrollment Rate
11. Follow-up Due / Overdue
12. Lead / Stage Aging
```

6 dimension:

```text
Time
Sales / Team
Source
Program
Region
Stage
```

Cách tiếp cận này giúp dashboard:

- Gọn.
- Không bị overload.
- Có khả năng phân tích đa chiều.
- Sales tập trung hành động.
- Lead Sales tập trung kiểm soát, forecast và phát hiện bottleneck.
- Có thể mở rộng về sau mà không phá cấu trúc dashboard chính.

---

# 35. Checklist trước khi dev

## Business

- [ ] Chốt stage chuẩn.
- [ ] Chốt định nghĩa Opportunity.
- [ ] Chốt định nghĩa Enrollment.
- [ ] Chốt Target theo tháng hay kỳ tuyển sinh.
- [ ] Chốt owner attribution.
- [ ] Chốt Stage Probability.
- [ ] Chốt Stage Aging SLA.
- [ ] Chốt Win Rate formula.
- [ ] Chốt dimension cần filter.
- [ ] Chốt permission Sales / Lead Sales.

## Data

- [ ] Có Stage History.
- [ ] Có current_stage_entered_at.
- [ ] Có next_follow_up_at.
- [ ] Có enrollment_date.
- [ ] Có source/program/region chuẩn.
- [ ] Có owner/team.
- [ ] Có target period.
- [ ] Có lost outcome.
- [ ] Có duplicate handling.

## UI

- [ ] KPI card chỉ dùng cho KPI tổng quan.
- [ ] Funnel dùng cho stage.
- [ ] Action List dùng cho follow-up.
- [ ] Table dùng cho Rep Performance.
- [ ] Drill-down từ KPI đến record.
- [ ] Global filter áp dụng nhất quán.
- [ ] Empty state rõ nghĩa.
- [ ] Warning dùng threshold cấu hình.
- [ ] Tooltip giải thích công thức KPI.

---

# 36. Tóm tắt cho BA / Dev

Nếu cần rút tài liệu thành requirement ngắn:

```text
Sales Dashboard:
- Scope theo current user.
- Tập trung Target, Forecast, Action, Pipeline Health.
- Mục tiêu: biết hôm nay cần làm gì để đạt target.

Lead Sales Dashboard:
- Scope theo team.
- Tập trung Team Target, Forecast, Funnel, Exception, Rep Performance.
- Mục tiêu: biết team có đạt target không và nghẽn ở đâu.

Core KPI:
Enrollment
Target Achievement
Target Remaining
Expected Enrollment
Pipeline Coverage
Open Opportunities
New Opportunities
Stage Volume
Stage Conversion
Enrollment Rate
Follow-up Due / Overdue
Lead / Stage Aging

Dimension:
Time
Sales/Team
Source
Program
Region
Stage
```
