# Student 360 CRM — Redesign Proposal
## Phiên bản căn chỉnh theo tài liệu Student 360

> **Source of Truth:** Tài liệu *“Student 360 — Phân tích chân dung và cơ chế phân loại thí sinh”*  
> File này chuyển các nguyên tắc nghiệp vụ trong tài liệu thành đề xuất UI/UX và CRM workflow.
>
> Quy ước:
>
> - **[SOURCE]**: yêu cầu / nguyên tắc được lấy trực tiếp từ tài liệu Student 360.
> - **[IMPLEMENTATION]**: cách đề xuất triển khai UI/UX hoặc data model để hiện thực hóa yêu cầu.
> - **[EXTENSION]**: tính năng mở rộng, không phải yêu cầu bắt buộc từ tài liệu gốc.

---

# 1. Mục tiêu

## 1.1. Mục tiêu nghiệp vụ

**[SOURCE]**

Student 360 phải giúp nhà trường hiểu thống nhất về một thí sinh:

1. Em là ai.
2. Em đến từ đâu.
3. Em đã làm gì.
4. Em đang ở đâu trong hành trình.
5. Em quan tâm điều gì.
6. Rào cản hiện tại là gì.
7. Em cần được chăm sóc theo cách nào.

Student 360 không chỉ là một màn hình phần mềm mà là một **khung hiểu chung** giữa:

- Marketing
- Tư vấn tuyển sinh
- Hoạt động thực địa
- CRM / lớp trí tuệ

---

## 1.2. Mục tiêu của màn Student Detail

**[IMPLEMENTATION]**

Khi counselor mở Student Detail, trong khoảng **5–10 giây** phải trả lời được:

1. Đây là học sinh nào?
2. Đang ở giai đoạn nào?
3. Mức độ quan tâm ra sao?
4. Mức độ phù hợp ra sao?
5. Rào cản chính là gì?
6. Cần làm gì tiếp theo?

Màn hình phải hướng tới:

> **Decision-first + Actionable CRM**

thay vì chỉ là dashboard hiển thị nhiều dữ liệu.

---

# 2. Nguyên tắc thiết kế

## 2.1. Một học sinh — một hồ sơ

**[SOURCE]**

Mọi dữ liệu từ nhiều kênh phải hội tụ về cùng một Student 360.

Các nguồn có thể bao gồm:

- Website
- Form
- Zalo
- Call
- Event
- Marketing campaign
- Tư vấn tại trường
- Người giới thiệu
- Hồ sơ tuyển sinh

Không tạo nhiều hồ sơ cho cùng một thí sinh nếu có thể khử trùng lặp bằng dữ liệu định danh phù hợp.

---

## 2.2. Phân biệt dữ liệu thật và dữ liệu suy luận

**[SOURCE]**

Không trộn lẫn:

### Dữ liệu do thí sinh / phụ huynh cung cấp

Ví dụ:

```text
GPA: 8.7
IELTS: 6.5
Ngành quan tâm: AI
Phụ huynh quan tâm học phí
```

với:

### Dữ liệu hệ thống suy luận

Ví dụ:

```text
Interest Level: High
Fit Level: High
Main Barrier: Financial
Enrollment Probability: 82%
```

**[IMPLEMENTATION]**

UI nên có nhãn hoặc tooltip để người dùng biết thông tin nào là:

```text
Provided Data
Observed Signal
System Inference
Human Confirmed
```

---

## 2.3. Explainable Classification

**[SOURCE]**

Mỗi phân loại do hệ thống sinh ra phải có:

- lý do đọc được;
- khả năng để tư vấn viên kiểm chứng;
- khả năng để người dùng điều chỉnh nếu thấy sai.

**[IMPLEMENTATION]**

Mỗi insight nên có:

```text
Why this?
Evidence
Source
Last updated
Confirmed by
```

---

## 2.4. Phân loại phải cập nhật liên tục

**[SOURCE]**

Classification không phải nhãn gán một lần.

Nó phải thay đổi khi có tương tác mới.

Ví dụ:

```text
Interest:
Medium
↓
High

Main Barrier:
Information
↓
Financial
```

---

# 3. Bốn chiều phân loại chính

Đây là phần cốt lõi của Student 360.

## QUAN TRỌNG

Chỉ có **4 chiều phân loại chính theo tài liệu**:

```text
1. Journey Stage
2. Interest Level
3. Fit Level
4. Main Barrier
```

Không gọi:

```text
Family Readiness
Application Readiness
Enrollment Probability
Priority Score
```

là bốn chiều phân loại gốc.

Các metric đó nếu có chỉ là thông tin bổ sung hoặc extension.

---

# 4. Dimension 1 — Journey Stage

## 4.1. Ý nghĩa

**[SOURCE]**

Xác định vị trí của thí sinh trong hành trình tuyển sinh.

Ví dụ:

```text
Chưa biết đến trường
↓
Đã biết
↓
Đang tìm hiểu
↓
Đang cân nhắc nghiêm túc
↓
Đã nộp hồ sơ
↓
Đã trúng tuyển
↓
Đã nhập học
```

---

## 4.2. UI đề xuất

**[IMPLEMENTATION]**

```text
ADMISSION JOURNEY

✓ Awareness
     ↓
✓ Exploring
     ↓
● Considering
     ↓
○ Application
     ↓
○ Admission
     ↓
○ Enrolled
```

Hoặc dùng terminology thực tế của hệ thống hiện tại nếu đã được chốt.

---

## 4.3. Stage History

**[IMPLEMENTATION]**

Nên lưu lịch sử thay đổi stage:

```text
01/06
Exploring

04/06
Considering

08/06
Application Started
```

---

## 4.4. Time in Stage

**[EXTENSION]**

Có thể bổ sung:

```text
Current Stage
Consulting

Time in stage
4 days
```

Nếu có benchmark:

```text
Average cohort
2.3 days
```

Đây là tính năng mở rộng để phát hiện lead bị stuck, không phải yêu cầu bắt buộc từ tài liệu.

---

# 5. Dimension 2 — Interest Level

## 5.1. Ý nghĩa

**[SOURCE]**

Interest phải dựa trên **tín hiệu hành vi quan sát được**, không dựa trên cảm nhận chủ quan của counselor.

Các mức:

```text
High
Medium
Low
Unknown
```

---

## 5.2. Signal ví dụ

**[SOURCE + IMPLEMENTATION]**

Tín hiệu có thể gồm:

- Chủ động hỏi lại nhiều lần.
- Tham dự sự kiện.
- Hỏi học phí.
- Hỏi thủ tục.
- Xem nội dung nhiều lần.
- Phản hồi Zalo.
- Tiếp tục cuộc gọi.
- Tải brochure.
- Xem trang ngành.

---

## 5.3. UI

```text
INTEREST

High

Evidence
• Viewed AI program page 4 times
• Asked about tuition
• Joined Career Talk
• Replied on Zalo

Last updated
Today 10:32
```

---

## 5.4. Interest Score

**[EXTENSION]**

Nếu hệ thống muốn dùng score:

```text
Interest Score
86 / 100
```

thì đây là representation mở rộng.

Source of truth vẫn phải là:

```text
Interest Level = High
```

Score không được thay thế hoàn toàn classification dễ đọc.

---

# 6. Dimension 3 — Fit Level

## 6.1. Ý nghĩa

**[SOURCE]**

Fit khác Interest.

Một thí sinh có thể:

```text
Interest High
Fit Low
```

hoặc:

```text
Interest Low
Fit High
```

---

## 6.2. Fit phải xem xét

**[SOURCE]**

- Ngành mong muốn có được đào tạo không?
- Phương thức xét tuyển có khả thi không?
- Hồ sơ học tập có phù hợp không?
- Điều kiện địa lý có khả thi không?
- Điều kiện chi phí có khả thi không?

---

## 6.3. UI

```text
FIT

High

Academic
Strong

Program Match
AI

Admission Method
Feasible

Location
Manageable
```

---

## 6.4. Fit Score

**[EXTENSION]**

Có thể thêm:

```text
Fit Score
91 / 100
```

nhưng phải luôn có explanation.

Không được hiển thị score mà thiếu cơ sở.

---

# 7. Dimension 4 — Main Barrier

## 7.1. Ý nghĩa

**[SOURCE]**

Main Barrier trả lời:

> Điều gì đang ngăn thí sinh tiến tới bước tiếp theo?

---

## 7.2. Barrier taxonomy

**[SOURCE]**

```text
Financial
Academic Ability
Family
Information
Geography
Competition
```

---

## 7.3. Mapping barrier → action

### Financial

```text
Need:
Scholarship
Financial support
Tuition payment plan
```

### Academic Ability

```text
Need:
Alternative admission method
More suitable program
```

### Family

```text
Need:
Contact parent directly
Parent-focused content
```

### Information

```text
Need:
Detailed program information
Career outcomes
Talk with student/alumni
```

### Geography

```text
Need:
Dormitory
Living cost
Travel
Community
```

### Competition

```text
Need:
Clear differentiation
Program comparison
Outcome comparison
```

---

# 8. Financial Data — Rule bắt buộc

## 8.1. Sensitive Data

**[SOURCE]**

Điều kiện kinh tế là thông tin nhạy cảm.

Chỉ ghi nhận khi:

- thí sinh chủ động chia sẻ;
- hoặc phụ huynh chủ động chia sẻ.

---

## 8.2. Không dùng để giảm chăm sóc

**[SOURCE]**

Financial condition:

```text
CAN BE USED FOR:
✓ Scholarship recommendation
✓ Tuition support
✓ Payment plan
✓ Financial counseling
```

Không được dùng cho:

```text
✗ Reduce care priority
✗ Exclude student
✗ Automatically reject
✗ Reduce service level
```

---

## 8.3. Financial Barrier khác Financial Condition

Ví dụ:

```text
Main Barrier
Financial
```

có thể hợp lệ vì học sinh đang lo học phí.

Nhưng:

```text
Family Income = Low
→ Priority = Low
```

là logic không phù hợp với source.

---

# 9. Kết hợp bốn chiều thành hành động

## 9.1. Quy tắc gốc

**[SOURCE]**

Bốn chiều không dùng độc lập mà phải được kết hợp thành cách chăm sóc.

---

## 9.2. Ví dụ

### Interest High + Fit High

```text
Interpretation
Khả năng chuyển đổi tốt

Action
Liên hệ ngay
Theo sát
Ưu tiên counselor phù hợp
```

### Interest High + Fit Low

```text
Interpretation
Student muốn nhưng phương án hiện tại khó khả thi

Action
Tư vấn trung thực
Alternative admission method
Alternative program
```

### Interest Low + Fit High

```text
Interpretation
Nhóm dễ bị bỏ sót

Action
Chủ động tiếp cận
Nội dung đúng mối quan tâm
```

### Interest Low + Fit Low

```text
Interpretation
Khả năng chuyển đổi thấp

Action
Automated nurturing
Không cần dùng quá nhiều nguồn lực tư vấn trực tiếp
```

### Any + Family Barrier

```text
Action
Chuyển hướng chăm sóc sang parent
```

---

# 10. Proposed Student Detail Layout

## 10.1. Information hierarchy

```text
Header
↓
Decision Center
↓
Four-Dimension Classification
↓
Admission Journey
↓
Reason / Evidence
↓
Detail Tabs
```

---

# 11. Header

```text
Nguyễn Minh An
HIGH PRIORITY

AI
THPT Châu Văn Liêm
Cần Thơ

Owner
Trần Quốc Bảo

Current Stage
Considering
```

---

## 11.1. Quick actions

**[IMPLEMENTATION]**

```text
[Edit]
[Assign]
[Create Task]
[Schedule]
[More]
```

---

# 12. Decision Center

Decision Center phải trả lời:

```text
What is happening?
Why?
What should I do?
```

---

## 12.1. Example

```text
┌──────────────────────────────┬───────────────────────────────┐
│ STUDENT STATUS               │ NEXT BEST ACTION              │
│                              │                               │
│ Journey                      │ Call father                   │
│ Considering                  │                               │
│                              │ Best time                     │
│ Interest                     │ 16:00–18:00                   │
│ HIGH                         │                               │
│                              │ Discuss                       │
│ Fit                          │ • Tuition                     │
│ HIGH                         │ • Scholarship                 │
│                              │                               │
│ Main Barrier                 │ [Call] [Zalo] [Schedule]      │
│ Financial                    │                               │
└──────────────────────────────┴───────────────────────────────┘
```

Đây là layout bám sát source hơn phiên bản trước.

---

# 13. Enrollment Probability

## 13.1. Vị trí của metric này

**[SOURCE]**

Tài liệu cho phép lớp đánh giá/trạng thái có:

```text
Enrollment Probability
```

nhưng đây **không phải một trong bốn chiều phân loại**.

---

## 13.2. UI đề xuất

**[IMPLEMENTATION]**

Có thể hiển thị bên cạnh decision center:

```text
ENROLLMENT PROBABILITY

82%

Confidence
76%

Trend
+13 / 7 days
```

---

## 13.3. Rule

Không được sử dụng chung `82%` cho:

```text
Interest
Fit
Enrollment Probability
Readiness
```

Mỗi metric phải có meaning riêng.

---

# 14. Why 82%

## 14.1. Explainability

**[SOURCE + IMPLEMENTATION]**

Nếu CRM có probability hoặc AI-generated assessment, cần explanation đọc được.

Ví dụ:

```text
WHY 82%

Positive evidence

+ Repeated AI program engagement
+ Parent involved
+ Admission route appears feasible
+ Counselor interaction increasing

Risk / barriers

- Financial concern
- Application not started
```

---

## 14.2. Không bắt buộc phải hiển thị mathematical weight

**[IMPLEMENTATION]**

Nếu model không thực sự sinh numeric contribution:

Không nên giả lập kiểu:

```text
+18
+14
-11
```

Chỉ hiển thị numeric contribution khi backend/model thực sự hỗ trợ.

Nếu không:

```text
Strong positive signal
Moderate positive signal
Main risk
```

---

# 15. Parent / Family

## 15.1. Parent là co-decision-maker

**[SOURCE]**

Phụ huynh không phải đối tượng phụ.

Có thể quyết định:

- Chi phí
- Địa điểm học
- Uy tín
- Việc làm
- Mức độ an toàn

Trong khi thí sinh thường quyết định mạnh hơn về ngành học.

---

## 15.2. Family UI

**[IMPLEMENTATION]**

```text
DECISION UNIT

Nguyễn Minh An
Student

Primary interest
Artificial Intelligence


Nguyễn Văn Minh
Father

Decision role
High

Main concerns
• Tuition
• Scholarship
• Employment

Preferred channel
Call
```

---

## 15.3. Family Readiness

**[EXTENSION]**

Có thể có:

```text
Family Readiness
78 / 100
```

nhưng:

> Đây không phải chiều phân loại thứ 4.

Chiều thứ 4 theo source vẫn là:

```text
Main Barrier
```

Family Readiness chỉ là supporting indicator.

---

# 16. Application

## 16.1. Application data

**[IMPLEMENTATION]**

```text
Application Status
Preparing

Documents
2 / 5

Progress
40%
```

---

## 16.2. Data consistency

Không để:

```text
0 / 5
```

ở một component và:

```text
2 / 5
```

ở component khác nếu hai nơi đang nói cùng một document set.

---

## 16.3. Application Readiness

**[EXTENSION]**

Có thể dùng:

```text
Application Readiness
42 / 100
```

nhưng đây là supporting indicator, không phải dimension chính trong source.

---

# 17. Chân dung & nguồn

## 17.1. Identity & Demographic Layer

**[SOURCE]**

Bao gồm:

- Họ tên
- Liên hệ
- Năm sinh
- Trường THPT
- Địa bàn
- Khối lớp
- Phụ huynh

---

## 17.2. Source & Attribution Layer

**[SOURCE]**

Bao gồm:

- First-touch channel
- Campaign
- Event
- Referral source
- School visit
- Marketing source

Rule:

> Ghi nhận nguồn ngay tại điểm thu, không suy đoán về sau.

---

# 18. Activity / Interaction

## 18.1. Interaction Layer

**[SOURCE]**

Bao gồm:

- Hội thoại
- Call
- Event attendance
- Content viewed
- Counselor interaction
- Field activity

---

## 18.2. Timeline UI

**[IMPLEMENTATION]**

```text
● STUDENT ACTION
Viewed tuition page

● COUNSELOR ACTION
Called parent

● SYSTEM EVENT
Lead form submitted

◆ SYSTEM INFERENCE
Financial barrier detected
```

---

## 18.3. Touchpoint count

Nếu có:

```text
32 total interactions
```

mà timeline chỉ hiển thị 7:

```text
7 key milestones shown
[View all 32]
```

Không ghi hai con số như thể chúng đại diện cùng một metric.

---

# 19. Proposed Tabs

```text
Overview
Profile
Source
Family
Journey
Application
Activity
```

---

# 20. Tab Overview

Chỉ hiển thị snapshot.

```text
Student Snapshot

Program
Artificial Intelligence

School
THPT Châu Văn Liêm

Province
Cần Thơ

Journey
Considering

Interest
High

Fit
High

Main Barrier
Financial
```

---

# 21. Tab Profile

```text
Personal
Education
Academic
Program Interest
Contact
```

---

# 22. Tab Source

```text
First-touch
Campaign
Event
Referral
Attribution
Source history
```

---

# 23. Tab Family

```text
Parent / Guardian
Relationship
Contact
Main concerns
Preferred channel
Level of participation
```

---

# 24. Tab Journey

```text
Stage history
Major milestones
Interest evolution
Fit evolution
Barrier evolution
```

---

# 25. Tab Application

```text
Application status
Admission method
Documents
Scholarship
Admission requirements
```

---

# 26. Tab Activity

```text
Calls
Messages
Website events
Events
Tasks
Counselor notes
System inferences
```

---

# 27. Minimum Data Set

## 27.1. Source requirement

**[SOURCE]**

Minimum data để cơ chế classification bắt đầu hoạt động:

- Full Name
- Phone
- High School
- Grade
- Program Interest
- Source
- At least one meaningful interaction

---

## 27.2. Progressive Profiling

**[SOURCE]**

Không nên bắt form đầu tiên thu quá nhiều dữ liệu.

Đề xuất:

```text
First touch
↓
Collect minimum information

Later interactions
↓
Progressively enrich Student 360
```

---

# 28. Grade / Study Stage

## 28.1. Source segmentation

**[SOURCE]**

CRM nên phân biệt:

```text
Grade 10
Grade 11
Grade 12 Semester 1
Grade 12 Semester 2
Post-exam
```

vì mục tiêu chăm sóc khác nhau.

---

## 28.2. UI

```text
Study Stage
Grade 12 — Semester 1

Recommended content
• Admission methods
• Scholarship
• Career outcome
```

---

# 29. High School Segmentation

## 29.1. Source segmentation

**[SOURCE]**

School-level classification có thể gồm:

```text
Strong historical enrollment
High interest / low enrollment
Untapped high-potential school
Repeatedly approached / low outcome
```

---

## 29.2. Student Detail usage

**[IMPLEMENTATION]**

Student Detail có thể hiển thị context:

```text
THPT Châu Văn Liêm

School Segment
High Interest / Medium Enrollment

School-level insight
Students from this school often ask about relocation and tuition
```

Nếu hệ thống có dữ liệu thực tế hỗ trợ.

---

# 30. Geography

## 30.1. Source segmentation

**[SOURCE]**

Địa bàn ảnh hưởng đến:

- khả năng tham quan;
- chi phí sinh hoạt;
- tâm lý xa nhà;
- nhu cầu ký túc xá;
- travel / transportation.

---

## 30.2. Geography không phải Fit tuyệt đối

**[IMPLEMENTATION]**

Không nên suy luận:

```text
Far province
=
Bad fit
```

một cách tự động.

Phải xem:

```text
Student concern
Parent concern
Dormitory availability
Financial feasibility
```

---

# 31. Next Best Action

## 31.1. Source principle

**[SOURCE]**

Classification phải dẫn đến cách chăm sóc.

---

## 31.2. UI

**[IMPLEMENTATION]**

```text
NEXT BEST ACTION

Call parent

Reason
Financial barrier

Objective
Explain tuition and scholarship options

Preferred channel
Call

[Call]
[Schedule]
[Complete]
```

---

## 31.3. Multiple recommendations

**[EXTENSION]**

Có thể rank:

```text
1. Call parent
2. Send scholarship information
3. Invite to Open Day
```

nhưng chỉ nên highlight một action chính.

---

# 32. Recommendation Approval

## 32.1. Human confirmation

**[SOURCE]**

System-generated assessment phải có người xác nhận trước khi tác động tới thí sinh.

---

## 32.2. UI

**[IMPLEMENTATION]**

Có thể:

```text
System recommends:
Call parent about tuition

[Approve & Call]
[Modify]
[Reject]
```

---

# 33. Recommendation Feedback Loop

**[EXTENSION]**

Sau action:

```text
Recommendation
Call parent

Result
Parent requested scholarship info
```

Có thể dùng dữ liệu outcome để cải thiện recommendation sau này.

Không phải requirement gốc.

---

# 34. Priority

## 34.1. Source principle

**[SOURCE]**

Nguồn lực tư vấn có hạn nên classification phải giúp trả lời:

> Nên dành thời gian cho ai trước và nói gì với em?

---

## 34.2. Priority label

**[IMPLEMENTATION]**

Có thể:

```text
URGENT
HIGH
NORMAL
LOW
```

---

## 34.3. Không dùng sensitive economics để giảm Priority

**[SOURCE]**

Không dùng:

```text
Low income
→ Low priority
```

---

## 34.4. Priority formula

**[EXTENSION]**

Nếu muốn xây engine:

```text
Priority =
Journey urgency
+ Interest
+ Fit
+ Deadline
+ Need for intervention
```

Đây chỉ là hướng triển khai.

Không xem đây là công thức chính thức của tài liệu.

---

# 35. Opportunity / Revenue

**[EXTENSION — DIRECTOR ONLY]**

PDF gốc không định nghĩa Student 360 như revenue opportunity.

Nếu Director cần CRM business view có thể thêm:

```text
Estimated Tuition
Scholarship
Expected Net Tuition
Enrollment Probability
Expected Value
```

Nhưng phải được phân tách khỏi source-based classification.

Không được để expected revenue quyết định mức độ quyền được chăm sóc của thí sinh.

---

# 36. Counselor View

**[IMPLEMENTATION]**

Ưu tiên:

- Current Journey
- Interest
- Fit
- Barrier
- Next Best Action
- Family
- Tasks
- Timeline
- Application

---

# 37. Director View

**[EXTENSION]**

Có thể thêm:

- Funnel analytics
- Counselor workload
- Time in stage
- Cohort comparison
- Source effectiveness
- School effectiveness
- Attribution
- Enrollment outcome

---

# 38. Data Structure

## 38.1. Core entities

**[IMPLEMENTATION]**

```text
Student
StudentProfile
FamilyMember
LeadSource
StudentInteraction
StudentStage
StudentStageHistory
StudentClassification
StudentBarrier
SystemInference
NextBestAction
Task
Application
ApplicationDocument
ProgramInterest
Counselor
```

---

# 39. Classification Object

```json
{
  "journey": {
    "stage": "considering",
    "reason": "Repeated inquiry and counselor engagement"
  },

  "interest": {
    "level": "high",
    "reason": [
      "Viewed AI program multiple times",
      "Asked about tuition",
      "Responded on Zalo"
    ]
  },

  "fit": {
    "level": "high",
    "reason": [
      "Program available",
      "Academic profile appears feasible",
      "Admission route appears viable"
    ]
  },

  "main_barrier": {
    "type": "financial",
    "reason": "Student and parent repeatedly asked about tuition"
  }
}
```

Đây mới là representation trực tiếp của **4-dimensional classification**.

---

# 40. Optional Intelligence Object

**[EXTENSION]**

```json
{
  "enrollment_probability": {
    "value": 82,
    "confidence": 76,
    "trend_7d": 13
  },

  "supporting_indicators": {
    "interest_score": 86,
    "fit_score": 91,
    "family_readiness": 78,
    "application_readiness": 42
  }
}
```

Không gọi `supporting_indicators` là bốn chiều classification.

---

# 41. Recommended API Response

```json
{
  "student": {
    "id": "STU-001",
    "name": "Nguyễn Minh An",
    "school": "THPT Châu Văn Liêm",
    "province": "Cần Thơ",
    "grade": "12",
    "program_interest": "Artificial Intelligence",

    "owner": {
      "id": "ADV-01",
      "name": "Trần Quốc Bảo"
    }
  },

  "classification": {
    "journey": "considering",
    "interest": "high",
    "fit": "high",
    "main_barrier": "financial"
  },

  "explanation": {
    "interest": [
      "Repeated program engagement",
      "Asked about tuition"
    ],
    "fit": [
      "Academic profile appears feasible",
      "Program matches stated interest"
    ],
    "barrier": [
      "Student and parent raised tuition concern"
    ]
  },

  "next_best_action": {
    "type": "call_parent",
    "reason": "financial_barrier",
    "objective": "Explain tuition and scholarship options"
  }
}
```

---

# 42. Data Provenance

## 42.1. Mỗi insight nên biết nguồn

**[IMPLEMENTATION]**

```text
Source:
Website

Observed:
01/06 21:32

Inference:
Financial interest increased

Confirmed:
Counselor Trần Quốc Bảo
```

---

## 42.2. Source attribution

**[SOURCE]**

Không suy đoán retrospectively nguồn tiếp cận.

Phải ghi nguồn tại điểm thu nếu có thể.

---

# 43. Personal Data Protection

## 43.1. Source requirements

**[SOURCE]**

CRM phải lưu ý:

- Consent.
- Purpose.
- Parent/guardian role với người chưa đủ tuổi.
- Role-based permission.
- Audit trail.
- Data retention.
- Right to view / edit / withdraw consent / request deletion.
- Không đưa dữ liệu ra dịch vụ ngoài chưa được phê duyệt.

---

## 43.2. Student Detail implementation

**[IMPLEMENTATION]**

Có thể có:

```text
Consent Status
Active

Consent Source
Career Talk Form

Consent Date
28/05/2026
```

và:

```text
Access Log
[View]
```

---

# 44. Measurement

## 44.1. Source KPIs

**[SOURCE]**

Hệ thống sau khi triển khai nên đo:

### Data Coverage

```text
% profiles with minimum required fields
```

### Classification Quality

```text
% high-classification students who actually enroll
```

### Human Correction Rate

```text
% system classification adjusted by counselors
```

### Care Effectiveness

```text
First-response time by group
```

### Source Effectiveness

```text
Cost per enrolled student by channel
```

### Early Coverage

```text
% profiles from Grade 10–11
```

---

# 45. UI Hierarchy

## Level 1 — Must see immediately

```text
Student
Journey
Interest
Fit
Main Barrier
Next Best Action
```

---

## Level 2 — Supporting intelligence

```text
Enrollment Probability
Confidence
Reason
Family
Study Stage
```

---

## Level 3 — Detailed tabs

```text
Profile
Source
Family
Journey
Application
Activity
```

---

## Level 4 — Audit / evidence

```text
Raw events
Source details
System inference
Human confirmation
Model metadata
```

---

# 46. Final Screen Proposal

```text
┌──────────────────────────────────────────────────────────────┐
│ Nguyễn Minh An                           HIGH PRIORITY       │
│ AI · THPT Châu Văn Liêm · Cần Thơ                           │
│ Owner: Trần Quốc Bảo                                        │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────┬───────────────────────────────┐
│ STUDENT CLASSIFICATION       │ NEXT BEST ACTION              │
│                              │                               │
│ Journey                      │ Call father                   │
│ Considering                  │                               │
│                              │ Reason                        │
│ Interest                     │ Financial Barrier             │
│ HIGH                         │                               │
│                              │ Objective                     │
│ Fit                          │ Tuition + Scholarship         │
│ HIGH                         │                               │
│                              │ Best channel                  │
│ Main Barrier                 │ Call                          │
│ FINANCIAL                    │                               │
│                              │ [Call] [Schedule] [Complete]  │
└──────────────────────────────┴───────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│ ENROLLMENT INTELLIGENCE                                     │
│                                                              │
│ Probability 82%          Confidence 76%        Trend +13     │
│                                                              │
│ Why                                                         │
│ + Strong program engagement                                 │
│ + Parent involved                                           │
│ + Admission path appears feasible                           │
│ - Financial concern                                         │
│                                                              │
│ [View evidence]                                             │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│ ADMISSION JOURNEY                                            │
│                                                              │
│ ✓ Awareness → ✓ Exploring → ● Considering → ○ Application   │
│                                      → ○ Admission → ○ Enroll│
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│ Overview │ Profile │ Source │ Family │ Journey │ Application│
│ Activity                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Detailed Student 360 data                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 47. Acceptance Criteria

## AC01 — Four Dimensions

UI phải thể hiện rõ:

```text
Journey
Interest
Fit
Main Barrier
```

---

## AC02 — Không thay đổi định nghĩa 4 chiều

Không được thay 4 chiều bằng:

```text
Interest
Fit
Family
Application
```

---

## AC03 — Decision Speed

Không scroll vẫn thấy:

- Student identity
- Journey
- Interest
- Fit
- Main Barrier
- Next Best Action

---

## AC04 — Explainability

Mọi system-generated classification phải có lý do đọc được.

---

## AC05 — Human Validation

Có cách để counselor:

```text
Confirm
Modify
Reject
```

system inference khi cần.

---

## AC06 — Continuous Update

Classification phải có thể cập nhật theo interaction mới.

---

## AC07 — Sensitive Data

Financial condition không được dùng để giảm mức chăm sóc.

---

## AC08 — Family

Phụ huynh phải được ghi nhận như co-decision-maker khi có dữ liệu.

---

## AC09 — Data Provenance

Phân biệt:

```text
Provided
Observed
Inferred
Confirmed
```

---

## AC10 — Consistent Data

Các metric / document count / touchpoint count phải nhất quán.

---

## AC11 — Minimum Data

Không yêu cầu thu quá nhiều field ở first touch.

---

## AC12 — Role-Based Access

Dữ liệu cá nhân phải được truy cập theo role phù hợp.

---

# 48. Implementation Priority

## Phase 1 — Align UI with Student 360

```text
Header
Four Dimensions
Next Best Action
Journey
Explainability
Tabs
```

---

## Phase 2 — Normalize Data

```text
Student identity
Source
Interaction
Journey
Interest
Fit
Barrier
Family
```

---

## Phase 3 — CRM Actions

```text
Call
Message
Schedule
Task
Complete
```

---

## Phase 4 — Intelligence

```text
Enrollment probability
Confidence
Recommendation engine
Barrier detection
```

---

## Phase 5 — Extensions

```text
Family readiness
Application readiness
Priority engine
Cohort benchmark
Director analytics
Revenue opportunity
```

---

# 49. Source-of-Truth vs Extension Summary

## SOURCE

```text
Student identity
Source
Interaction
Journey
Interest
Fit
Main Barrier
Parent involvement
Enrollment probability as assessment
Explainability
Human confirmation
Continuous classification
Minimum data
Consent
Data protection
Measurement
```

---

## IMPLEMENTATION

```text
Decision Center
Next Best Action card
Timeline visual
Tabs
CTA
Stage history
Data provenance badges
Evidence drawer
```

---

## EXTENSION

```text
Numeric Interest Score
Numeric Fit Score
Family Readiness Score
Application Readiness Score
Priority Formula
Stage Benchmark
Revenue Opportunity
Recommendation Feedback Loop
Director Revenue Analytics
```

---

# 50. Product Principle

Student 360 phải trả lời được:

> **Em là ai?**

> **Em đến từ đâu?**

> **Em đang ở đâu trong hành trình?**

> **Em đang quan tâm đến mức nào?**

> **Em có phù hợp không?**

> **Điều gì đang cản em tiến tới bước tiếp theo?**

> **Chúng ta nên chăm sóc em như thế nào?**

UI/CRM chỉ là cách hiện thực hóa các câu hỏi đó.

Mục tiêu cuối cùng không phải tạo một dashboard nhiều số liệu.

Mục tiêu là biến Student 360 thành:

> **một hồ sơ thống nhất + một cơ chế phân loại có giải thích + một hệ thống hỗ trợ counselor đưa ra hành động phù hợp.**
