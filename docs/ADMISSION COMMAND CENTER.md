# ADMISSION COMMAND CENTER
## Đặc tả hệ thống Dashboard Tuyển sinh AI-Native

### 1. Mục tiêu sản phẩm

Xây dựng một **Admission Command Center** cho Đại học FPT, không đơn thuần là dashboard báo cáo hay CRM tuyển sinh, mà là một **AI-Native Admission Intelligence Platform**.

Hệ thống giúp các cấp quản lý và đội ngũ tuyển sinh:

- Quan sát toàn cảnh thị trường tuyển sinh.
- Phân tích theo khu vực địa lý, trường THPT và nhóm người học.
- Theo dõi toàn bộ hành trình từ Prospect → Qualified → Application → Enrollment.
- Đánh giá hiệu quả của Sales, Promoter và Marketing.
- Dự báo Enrollment và doanh thu học phí.
- Phát hiện cơ hội/rủi ro bằng AI.
- Đề xuất **Next Best Action** cho từng nhân sự hoặc từng nhóm thị trường.

Nguyên tắc thiết kế:

> **Observe → Understand → Predict → Act**

Hệ thống không chỉ trả lời **“What happened?”** mà phải tiến tới **“Why?”, “What will happen?” và “What should we do next?”**

---

# 2. Danh sách 10 màn hình lõi

| STT | Màn hình | Đối tượng chính | Mục tiêu |
|---|---|---|---|
| 01 | Admission Command Center | Executive | Toàn cảnh tuyển sinh |
| 02 | Market Intelligence Map | Executive / Manager | Phân tích thị trường và địa bàn |
| 03 | School Intelligence | Manager / Promoter | Phân tích từng trường THPT |
| 04 | Student 360° | Sales / Promoter | Hiểu toàn diện từng học sinh |
| 05 | Sales Pipeline | Sales / Manager | Quản lý cơ hội tuyển sinh |
| 06 | AI Next Best Action | Sales / Promoter / Manager | Đề xuất hành động tiếp theo |
| 07 | Regional Performance | Manager / Executive | Đánh giá hiệu suất khu vực |
| 08 | Campaign Intelligence | Marketing | Đánh giá hiệu quả Marketing |
| 09 | Demographic Explorer | Marketing / Strategy | Phân tích phân khúc người học |
| 10 | Revenue & Forecast | Executive / Manager | Dự báo Enrollment và doanh thu |

---

# 3. Màn hình 01 — Admission Command Center

## 3.1. Mục tiêu

Đây là màn hình Home của toàn bộ hệ thống.

Người dùng mở hệ thống và trong khoảng 30 giây phải trả lời được:

- Tuyển sinh hiện tại đang tốt hay xấu?
- Đang đạt bao nhiêu phần trăm Target?
- Khu vực nào đang tăng/giảm?
- Funnel đang nghẽn ở đâu?
- Cơ hội lớn nhất hiện tại là gì?
- Rủi ro lớn nhất là gì?
- AI đề xuất hành động gì?

## 3.2. Người dùng

- Ban lãnh đạo
- Ban tuyển sinh
- Head of Admission
- Regional Manager

## 3.3. Thông tin chính

### Admission KPI

- Total Prospects
- Qualified Prospects
- Applications
- Accepted
- Enrollment
- Conversion Rate
- Expected Enrollment
- Expected Revenue
- Actual Revenue
- Target Achievement

Mỗi KPI cần thể hiện:

- Giá trị hiện tại
- Target
- % đạt Target
- WoW
- MoM
- YoY
- Trend

## 3.4. Admission Funnel

```text
Prospect
   ↓
Engaged
   ↓
Qualified
   ↓
Counselling
   ↓
Application
   ↓
Accepted
   ↓
Enrolled
```

Cho phép click từng stage để drill-down.

Ví dụ:

Application conversion thấp → xem:

Region → Province → School → Sales → Student

## 3.5. Geographic Overview

Bản đồ Việt Nam thể hiện:

- Prospect density
- Qualified density
- Application
- Enrollment
- Conversion
- Revenue
- Growth
- Sales coverage
- Promoter coverage

## 3.6. AI Insight

AI tự động phát hiện:

### Risk

> Conversion tại Đồng Nai giảm 14% trong 14 ngày gần đây.

### Opportunity

> Một nhóm trường tại Cần Thơ có hơn 8.000 học sinh lớp 12 nhưng penetration còn thấp.

### Revenue Opportunity

> Nếu conversion của nhóm này tăng 3%, doanh thu dự kiến tăng 12,4B.

## 3.7. Executive Actions

AI đề xuất:

- Tăng Sales coverage.
- Tổ chức School Event.
- Re-engage prospects.
- Điều chỉnh campaign.
- Điều chuyển nguồn lực.

---

# 4. Màn hình 02 — Market Intelligence Map

## 4.1. Mục tiêu

Trả lời:

> **“Thị trường tuyển sinh của Đại học FPT đang nằm ở đâu và khu vực nào còn chưa được khai thác?”**

## 4.2. Main View

Bản đồ Việt Nam có khả năng drill-down:

```text
Vietnam
 ↓
Region
 ↓
Province
 ↓
District
 ↓
High School
```

## 4.3. Geographic Layers

Người dùng có thể chuyển layer:

### Market Size

- Population
- Grade 12 population
- Number of schools
- Number of prospects

### FPTU Penetration

- Leads
- Qualified
- Applications
- Enrollment

### Performance

- Conversion
- Growth
- Revenue

### Coverage

- Number of Sales
- Number of Promoters
- School visits
- Events

## 4.4. Province Detail

Ví dụ:

**Đồng Nai**

- Grade 12 Students: 42.000
- Prospects: 8.420
- Qualified: 1.820
- Applications: 620
- Enrollment: 280
- Penetration: 4,3%
- Potential Revenue: 28B

## 4.5. AI Opportunity Detection

AI tự động phát hiện:

- Untapped market
- High-growth area
- Low-conversion area
- Underserved school cluster
- Sales coverage gap
- Promoter coverage gap

Ví dụ:

> 12 trường THPT có 8.400 học sinh lớp 12 nhưng FPTU penetration chỉ 2,8%.

→ **Opportunity Score: 94/100**

---

# 5. Màn hình 03 — School Intelligence

## 5.1. Mục tiêu

Biến mỗi trường THPT thành một **Admission Account**.

Không chỉ lưu thông tin trường mà phải hiểu:

> Trường này có tiềm năng bao nhiêu? FPTU đang khai thác được bao nhiêu? Tại sao kết quả tốt/xấu?

## 5.2. School Header

Ví dụ:

**THPT Nguyễn Thượng Hiền**

- Potential Score: 92/100
- Grade 12 Students: 520
- Prospects: 128
- Applications: 38
- Enrollment: 21

## 5.3. School Profile

- Province
- District
- School Type
- Student Population
- Grade 10/11/12
- Academic Profile
- Historical Enrollment

## 5.4. Recruitment Performance

Theo năm:

```text
2024 → 14 Enrollment
2025 → 18 Enrollment
2026 → 21 Enrollment
```

Theo dõi:

- Prospect growth
- Application growth
- Enrollment growth
- Conversion

## 5.5. Student Demographics

Phân tích:

- Major interest
- Gender
- Academic profile
- Tuition segment
- Geographic distribution

## 5.6. School Activities

Timeline:

- School Visit
- Career Talk
- Open Day
- Parent Seminar
- Workshop
- Counselling

## 5.7. AI School Insight

AI phân tích:

> School Potential: HIGH

> Enrollment tốt trong các năm trước nhưng Application năm nay giảm 18%.

> Không có school event trong 45 ngày gần đây.

**Recommendation:** tổ chức Career Talk + Parent Session.

---

# 6. Màn hình 04 — Student 360°

## 6.1. Mục tiêu

Trả lời:

> **“Học sinh này là ai, đang ở đâu trong hành trình tuyển sinh và khả năng Enrollment là bao nhiêu?”**

Đây là màn hình trung tâm của Sales/Promoter.

## 6.2. Student Header

Ví dụ:

**Nguyễn Minh An**

- THPT ABC
- Grade 12
- AI / Computer Science
- High Intent
- Enrollment Probability: 82%

## 6.3. Profile

- Name
- Gender
- DOB
- Province
- District
- School
- Grade

## 6.4. Academic

- GPA
- English level
- Awards
- Competitions
- Interests
- Intended Major

## 6.5. Family

Quan hệ:

```text
Student
 ├── Father
 └── Mother
```

Thông tin:

- Parent
- Occupation
- Decision maker
- Communication preference
- Tuition concern
- Scholarship concern

## 6.6. Journey Timeline

Ví dụ:

```text
10 Aug — TikTok Ad
12 Aug — Website Visit
14 Aug — Open Day
16 Aug — Counselor Call
20 Aug — Campus Visit
25 Aug — Application Started
```

## 6.7. Engagement

- Website
- Landing page
- Event
- Email
- Zalo
- Call
- Meeting
- Campus visit
- Scholarship interaction

## 6.8. Application

- Program
- Intake
- Application status
- Documents
- Scholarship
- Payment
- Enrollment

## 6.9. AI Student Insight

AI xác định:

- Intent
- Enrollment probability
- Main concern
- Decision maker
- Recommended action

Ví dụ:

> Intent: HIGH  
> Main concern: Tuition  
> Parent likely decision maker  
> Recommendation: Parent consultation + scholarship explanation

---

# 7. Màn hình 05 — Sales Pipeline

## 7.1. Mục tiêu

Trả lời:

> **“Đội Sales đang có bao nhiêu cơ hội và cần xử lý gì?”**

## 7.2. Pipeline

```text
NEW
 ↓
ENGAGED
 ↓
QUALIFIED
 ↓
COUNSELLING
 ↓
APPLICATION
 ↓
ACCEPTED
 ↓
ENROLLED
```

## 7.3. Lead/Prospect Card

Mỗi card:

- Student
- School
- Region
- Major
- Lead Source
- Score
- Probability
- Last Interaction
- Next Action
- Owner

## 7.4. Filter

- Sales
- Region
- Province
- School
- Program
- Source
- Score
- Probability
- Stage
- Last Activity

## 7.5. Risk Detection

AI highlight:

- No activity > 7 days
- Application stalled
- Parent concern unresolved
- Low response
- Enrollment probability declining

## 7.6. Daily Work Queue

```text
18 Follow-ups
7 Hot Leads
4 Parent Calls
3 Application Issues
2 Campus Visits
```

Màn hình phải hướng tới **Action**, không chỉ Reporting.

---

# 8. Màn hình 06 — AI Next Best Action

## 8.1. Mục tiêu

Đây là màn hình AI quan trọng nhất.

Thay vì:

> “Có bao nhiêu Lead?”

hệ thống trả lời:

> **“Bây giờ chúng ta nên làm gì?”**

## 8.2. AI Opportunity Queue

Ví dụ:

### 01 — Nguyễn Minh A

- Probability: 82%
- Action: Call Parent
- Priority: HIGH

### 02 — Trần Minh B

- Probability: 79%
- Action: Scholarship Consultation

### 03 — Lê Minh C

- Probability: 74%
- Action: Invite Open Day

## 8.3. AI Explanation

AI phải giải thích **Why**.

Ví dụ:

> Học sinh đã xem Tuition Page 3 lần, tham gia Open Day và phụ huynh đã xem Scholarship Page.

→ Enrollment probability tăng từ 68% lên 82%.

## 8.4. Recommendation

Mỗi recommendation gồm:

- What
- Why
- When
- Expected impact
- Confidence

## 8.5. Action

Các action trực tiếp:

- Call
- Send Zalo
- Send Email
- Schedule Meeting
- Invite Event
- Assign Sales
- Create Follow-up

Đây là bước chuyển từ:

**AI Analytics → AI Agentic Admission**

---

# 9. Màn hình 07 — Regional Performance

## 9.1. Mục tiêu

Dành cho Regional Manager và Head of Admission.

Trả lời:

> **“Khu vực nào đang tốt/xấu và team nào cần hỗ trợ?”**

## 9.2. Regional Scorecard

Ví dụ:

```text
HCM
Enrollment: 820
Target: 900
Achievement: 91%

Dong Nai
Enrollment: 280
Target: 250
Achievement: 112%

Mekong
Enrollment: 180
Target: 300
Achievement: 60%
```

## 9.3. Drill-down

```text
Region
 ↓
Province
 ↓
District
 ↓
Sales
 ↓
School
 ↓
Student
```

## 9.4. Sales Performance

- Leads assigned
- Contact rate
- Response time
- Qualified rate
- Applications
- Enrollment
- Conversion
- Revenue
- Follow-up overdue

## 9.5. Capacity Analysis

So sánh:

**Market Potential vs Sales Capacity**

Ví dụ:

```text
Potential Leads: 12.000
Sales Capacity:   7.500
Coverage:            62%
```

AI:

> Khu vực này cần thêm khoảng 3 Sales để đạt coverage 90%.

---

# 10. Màn hình 08 — Campaign Intelligence

## 10.1. Mục tiêu

Marketing phải trả lời:

> **“Campaign có tạo ra Enrollment và Revenue hay không?”**

Không chỉ:

> “Campaign có bao nhiêu leads?”

## 10.2. Campaign Funnel

```text
Impressions
 ↓
Clicks
 ↓
Landing Visits
 ↓
Leads
 ↓
Qualified
 ↓
Application
 ↓
Enrollment
```

## 10.3. Metrics

- Spend
- Reach
- CTR
- CPL
- CPQL
- CPA
- Applications
- Enrollment
- Revenue
- ROAS

## 10.4. Channel Attribution

So sánh:

- Facebook
- TikTok
- Google
- YouTube
- Zalo
- School Event
- Open Day
- Referral
- Promoter

Quan trọng nhất:

> **Cost → Qualified → Application → Enrollment → Revenue**

## 10.5. AI Campaign Insight

Ví dụ:

> TikTok tạo volume cao nhưng quality thấp.

> Facebook có CPQL tốt hơn.

> School Event có CAC cao nhưng Enrollment Rate cao nhất.

**Recommendation:**

> Chuyển 15% ngân sách từ TikTok sang School Event.

---

# 11. Màn hình 09 — Demographic Explorer

## 11.1. Mục tiêu

Xây dựng **Student Market Intelligence**.

Trả lời:

> **“Ai đang muốn học Đại học FPT?”**

và:

> **“Nhóm nào có tiềm năng nhưng chưa được khai thác?”**

## 11.2. Dynamic Segment Builder

### Geography

- Region
- Province
- District
- Urban/Rural

### Student

- Gender
- Grade
- Age
- Academic Performance

### Interest

- AI
- Software Engineering
- Business
- Design
- Hospitality

### Economic

- Tuition Capacity
- Scholarship Sensitivity

### Behavior

- Website Visit
- Event
- Campus Visit
- Zalo
- Email
- Application

## 11.3. Segment Result

Ví dụ:

> Female + Grade 12 + HCM + GPA > 8 + AI Interest + Tuition Capacity >100M

Kết quả:

```text
3.420 Prospects

1.280 Engaged
420 Qualified
160 Applications
68 Enrolled
```

## 11.4. Segment Comparison

So sánh:

**AI Students vs Business Students**

Các tiêu chí:

- Market size
- Conversion
- Application
- Enrollment
- Tuition
- Revenue
- Growth

## 11.5. AI Discovery

AI tự tìm pattern:

> Học sinh nữ quan tâm AI tại Đồng Nai tăng 31% MoM nhưng hiện chỉ chiếm 3,2% audience targeting.

→ **Emerging Opportunity**

---

# 12. Màn hình 10 — Revenue & Forecast

## 12.1. Mục tiêu

Biến Admission thành một **Business Forecasting System**.

Trả lời:

> **“Cuối kỳ dự kiến có bao nhiêu Enrollment và bao nhiêu doanh thu?”**

## 12.2. Forecast

```text
TARGET
5.000

CURRENT
3.820

FORECAST
4.680

GAP
-320
```

## 12.3. Scenario Simulation

Cho phép thay đổi:

- Conversion
- Lead volume
- Application rate
- Enrollment rate
- Scholarship rate

Ví dụ:

```text
Conversion +1%
→ +120 Enrollment

Conversion +3%
→ +360 Enrollment

Conversion +5%
→ +610 Enrollment
```

## 12.4. Revenue Model

Phân tích theo:

- Tuition
- Scholarship
- Discount
- Program
- Campus
- Intake
- Region
- Student Segment

## 12.5. Revenue by Region

```text
HCM          82B
Dong Nai     28B
Binh Duong   24B
Mekong       18B
North        30B
Other        ...
```

## 12.6. AI Forecast Explanation

AI không chỉ đưa ra con số mà phải giải thích:

> Forecast: 4.680 Enrollment

> Confidence: 72%

### Positive Drivers

- HCM conversion +8%
- AI program demand +18%
- New school partnerships

### Negative Drivers

- Mekong conversion -12%
- Application abandonment +6%

### Main Risk

> Mekong Region

---

# 13. Luồng liên kết giữa 10 màn hình

10 màn hình không nên tồn tại độc lập.

Chúng tạo thành một **Admission Intelligence Flow**:

```text
                 ADMISSION COMMAND CENTER
                          │
                          ▼
                 MARKET INTELLIGENCE
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              REGION          DEMOGRAPHIC
                 │
                 ▼
               SCHOOL
                 │
                 ▼
             STUDENT 360°
                 │
                 ▼
           SALES PIPELINE
                 │
                 ▼
        AI NEXT BEST ACTION
                 │
                 ▼
             ENROLLMENT
                 │
                 ▼
          REVENUE & FORECAST
```

Marketing chạy xuyên suốt hành trình:

```text
CAMPAIGN
   ↓
AUDIENCE
   ↓
PROSPECT
   ↓
STUDENT
   ↓
APPLICATION
   ↓
ENROLLMENT
   ↓
REVENUE
```

---

# 14. AI-Native Layer

AI không nên chỉ là một chatbot nằm bên góc màn hình.

AI phải xuất hiện xuyên suốt hệ thống.

## 14.1. Descriptive AI

**What happened?**

> Enrollment miền Tây giảm 8%.

## 14.2. Diagnostic AI

**Why?**

> 3 trường có volume lớn chưa được Sales tiếp cận trong 3 tuần.

## 14.3. Predictive AI

**What will happen?**

> Nếu xu hướng tiếp tục, tháng này có khả năng thiếu 240 Enrollment.

## 14.4. Prescriptive AI

**What should we do?**

> Tăng school visit tại Cần Thơ và phân bổ thêm 2 Sales.

---

# 15. Nguyên tắc UX quan trọng

Dashboard không nên được thiết kế theo tư duy:

> **Database → CRUD → Report**

Mà nên thiết kế:

> **Decision → Insight → Evidence → Action**

Ví dụ:

```text
PROBLEM
Enrollment giảm
      ↓
INSIGHT
Mekong giảm 12%
      ↓
EVIDENCE
4 trường lớn conversion thấp
      ↓
AI EXPLANATION
Thiếu school activity
      ↓
ACTION
Schedule School Event
      ↓
EXPECTED IMPACT
+80 projected enrollment
```

---

# 16. MVP đề xuất

Nếu cần xây prototype nhanh, chưa cần triển khai cả 10 màn hình.

Ưu tiên:

### Phase 1 — “Wow Demo”

**01. Admission Command Center**

↓

**02. Market Intelligence Map**

↓

**03. School Intelligence**

↓

**04. Student 360°**

↓

**06. AI Next Best Action**

Flow demo:

> **Toàn Việt Nam → Đồng Nai → một trường THPT → một học sinh → AI phân tích → AI đề xuất hành động.**

Đây là flow có khả năng thể hiện rõ nhất sự khác biệt giữa **Admission Command Center** và một CRM truyền thống.

### Phase 2 — Operational

- 05 Sales Pipeline
- 07 Regional Performance

### Phase 3 — Intelligence

- 08 Campaign Intelligence
- 09 Demographic Explorer
- 10 Revenue & Forecast

Mục tiêu cuối cùng là xây dựng một hệ thống mà người dùng không chỉ **nhìn thấy dữ liệu**, mà có thể **đi từ dữ liệu → insight → prediction → action** trong cùng một trải nghiệm.