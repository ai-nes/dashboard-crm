# Lead Sale — Thiết kế màn hình Tự động phân công học sinh

## 1. Mục tiêu màn hình

Màn hình **Tự động phân công học sinh** dành cho Lead Sale, dùng để:

- Chứng minh rõ hệ thống đang tự động phân công học sinh.
- Cho người dùng nhìn thấy luồng xử lý từ lúc học sinh mới vào hệ thống đến khi được gán cho Sale/CTV Sale.
- Giúp Lead Sale hiểu vì sao một học sinh được gán cho một nhân sự cụ thể.
- Hiển thị các trường hợp ngoại lệ cần con người can thiệp.
- Theo dõi lịch sử chạy và trạng thái của automation.

> Màn hình này không phải workflow builder hoàn chỉnh như n8n.  
> Mặc định là **read-only visualization + explainability + execution history**.

---

## 2. Tên màn hình

Khuyến nghị:

**Tự động phân công**

Tên phụ:

> Theo dõi cách hệ thống tự động phân bổ học sinh cho đội Sales.

Không nên dùng:

- Phân công học sinh
- Quản lý phân công
- Assign Lead

Vì các tên trên tạo cảm giác đây là thao tác thủ công.

---

## 3. Công nghệ đề xuất

```txt
Next.js
React
@xyflow/react
Tailwind CSS
shadcn/ui
Framer Motion
Lucide Icons
```

React Flow dùng cho:

- Node
- Edge
- Zoom
- Pan
- Fit View
- MiniMap nếu cần
- Custom Node
- Animated Edge

---

## 4. Cấu trúc tổng thể

```txt
┌──────────────────────────────────────────────────────────────┐
│ TỰ ĐỘNG PHÂN CÔNG                                          │
│ ● Đang hoạt động   94% tự động   31 lượt hôm nay           │
│                                      [Lịch sử] [Cài đặt]    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┬───────────────────┐
│                                          │                   │
│            WORKFLOW CANVAS               │   NODE DETAIL     │
│                                          │                   │
│ [New] → [Check] → [Classify] → [Score]   │ Rules             │
│                              ↓           │ Metrics           │
│                       [Assign Sale]       │ Explanation       │
│                              ↓           │                   │
│                         [Create NBA]      │                   │
│                                          │                   │
└──────────────────────────────────────────┴───────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ LỊCH SỬ CHẠY                                                │
│ Tất cả | Thành công | Cần xem xét | Lỗi                    │
└──────────────────────────────────────────────────────────────┘
```

Tỷ lệ layout desktop:

```txt
Workflow Canvas: 70–75%
Detail Panel:    25–30%
```

---

## 5. Header

### Nội dung

```txt
Tự động phân công

● Đang hoạt động
94% tự động
31 lượt phân công hôm nay

[Xem lịch sử]
```

Có thể bổ sung:

```txt
98.7% thành công
3 cần xem xét
```

### Không nên

Không đặt 8–10 KPI card trên đầu.

Header chỉ cần chứng minh:

1. Automation đang chạy.
2. Bao nhiêu trường hợp được xử lý tự động.
3. Có exception hay không.

---

## 6. Workflow chính

Luồng đề xuất:

```txt
[Học sinh mới]
        ↓
[Kiểm tra dữ liệu]
        ↓
[Phân loại học sinh]
        ↓
[Chấm điểm Sale]
        ↓
[Có người phù hợp?]
       / \
     Có   Không
     ↓       ↓
[Tự động   [Lead Sale
 phân công] xem xét]
     ↓
[Tạo Next Best Action]
     ↓
[Hoàn tất]
```

Nếu UI desktop rộng, ưu tiên layout **trái → phải**:

```txt
Học sinh mới
      →
Kiểm tra dữ liệu
      →
Phân loại
      →
Chấm điểm Sale
      →
Có người phù hợp?
   ↙            ↘
Phân công      Lead Sale xem xét
   ↓
Tạo NBA
```

---

## 7. Các node chính

### 7.1. Học sinh mới

```txt
┌─────────────────────────────┐
│ Học sinh mới               │
│                             │
│ 36 hôm nay                  │
│                             │
│ ● Đang nhận dữ liệu         │
└─────────────────────────────┘
```

Thông tin:

- Tổng học sinh mới.
- Nguồn vào hệ thống.
- Thời gian tiếp nhận gần nhất.

---

### 7.2. Kiểm tra dữ liệu

```txt
┌─────────────────────────────┐
│ Kiểm tra dữ liệu            │
│                             │
│ 36 đã kiểm tra              │
│ ✓ 34 hợp lệ                 │
│ ⚠ 2 thiếu dữ liệu           │
└─────────────────────────────┘
```

Rule ví dụ:

- Có số điện thoại.
- Có khu vực.
- Có trường THPT.
- Có ngành quan tâm hoặc nhóm ngành.
- Không bị duplicate nghiêm trọng.

---

### 7.3. Phân loại học sinh

```txt
┌─────────────────────────────┐
│ Phân loại học sinh          │
│                             │
│ 34 đã phân loại             │
│                             │
│ Khu vực · Ngành · Nguồn     │
└─────────────────────────────┘
```

Có thể phân loại theo:

- Tỉnh/thành.
- Trường THPT.
- Ngành quan tâm.
- Nguồn tuyển sinh.
- Mức độ ưu tiên.
- Nhóm học sinh.

---

### 7.4. Chấm điểm Sale

Node quan trọng nhất.

```txt
┌─────────────────────────────┐
│ Chấm điểm Sale              │
│                             │
│ 34 học sinh đã xử lý        │
│ ✓ 31 tìm được phù hợp       │
│ ⚠ 3 cần xem xét             │
│                             │
│ ● Đang hoạt động            │
└─────────────────────────────┘
```

Tiêu chí ví dụ:

```txt
Khu vực phụ trách       30%
Nhóm ngành              25%
Workload                20%
Hiệu suất               15%
SLA phản hồi            10%
```

Không bắt buộc dùng đúng các trọng số này; backend quyết định.

---

### 7.5. Có người phù hợp?

Condition Node.

```txt
┌─────────────────────────────┐
│ Có Sale phù hợp?            │
│                             │
│ Có                         31│
│ Không                       3│
└─────────────────────────────┘
```

Edge:

```txt
Có     → Tự động phân công
Không  → Lead Sale xem xét
```

---

### 7.6. Tự động phân công

```txt
┌─────────────────────────────┐
│ Tự động phân công           │
│                             │
│ ✓ 31 thành công             │
│ 1.8s thời gian TB           │
│                             │
│ ● Running                   │
└─────────────────────────────┘
```

Action:

```txt
student.owner = selectedSale
```

---

### 7.7. Lead Sale xem xét

Exception node.

```txt
┌─────────────────────────────┐
│ Cần Lead Sale xem xét       │
│                             │
│ ⚠ 3 học sinh                │
│                             │
│ [Xem danh sách]             │
└─────────────────────────────┘
```

Các lý do:

- Không có Sale phù hợp.
- Tất cả Sale trong khu vực quá tải.
- Thiếu dữ liệu.
- Match score dưới threshold.
- Rule conflict.
- Học sinh VIP / đặc biệt.

---

### 7.8. Tạo Next Best Action

```txt
┌─────────────────────────────┐
│ Tạo Next Best Action        │
│                             │
│ 31 NBA đã tạo               │
│                             │
│ ✓ Hoàn tất                  │
└─────────────────────────────┘
```

Ví dụ:

```txt
Gọi xác nhận nhu cầu
Hôm nay · 16:00–18:00
```

---

## 8. Node states

Mỗi node cần có trạng thái rõ ràng.

### Idle

```txt
○ Chưa chạy
```

### Running

```txt
● Đang xử lý
```

### Success

```txt
✓ Thành công
```

### Warning

```txt
⚠ Cần xem xét
```

### Error

```txt
✕ Lỗi
```

Không nên dùng màu làm cách duy nhất để phân biệt trạng thái. Luôn có:

- Icon.
- Label.
- Count nếu có.

---

## 9. Edge design

Edge nên:

- Cong nhẹ.
- Có directional arrow.
- Animated khi automation đang chạy.
- Selected edge rõ hơn.
- Không quá dày.

Ví dụ:

```txt
●────────────▶
```

Animation chỉ mang tính "pulse", không chạy liên tục quá mạnh.

---

## 10. Canvas style

### Background

```txt
#F8F9FB hoặc tương đương
```

Có dot grid nhẹ:

```txt
·   ·   ·   ·
  ·   ·   ·
·   ·   ·   ·
```

### Node

Khuyến nghị:

```txt
Width: 220–280px
Border radius: 12–16px
Border: 1px
Shadow: rất nhẹ
Background: white
Padding: 16–20px
```

Selected node:

- Border rõ hơn.
- Ring nhẹ.
- Không cần gradient.

---

## 11. Node Detail Panel

Click vào node → panel bên phải cập nhật.

### Ví dụ: Chấm điểm Sale

```txt
CHẤM ĐIỂM SALE

Trạng thái
● Đang hoạt động

Đã xử lý hôm nay
34 học sinh

Tiêu chí

Khu vực phụ trách       30%
Nhóm ngành              25%
Workload                20%
Hiệu suất               15%
SLA phản hồi            10%

[ Xem lần chạy gần nhất ]
```

---

## 12. Explainability — vì sao chọn Sale này?

Đây là phần rất quan trọng.

Ví dụ khi chọn một execution:

```txt
Nguyễn Minh An

Được phân cho
Nguyễn Văn A

Match score
92%

Lý do

✓ Phụ trách khu vực Cần Thơ
✓ Chuyên nhóm ngành CNTT
✓ Workload còn thấp
✓ SLA phản hồi tốt
✓ Hiệu suất nhóm này cao

Kết quả
Đã phân công lúc 06:08
```

Không chỉ hiển thị:

```txt
AI chọn Nguyễn Văn A
```

Phải giải thích lý do.

---

## 13. Candidate comparison

Có thể cho xem top 3 Sale được hệ thống cân nhắc.

```txt
Nguyễn Văn A      92%   Được chọn
Trần Văn B        81%
Lê Văn C          76%
```

Click từng Sale:

```txt
Nguyễn Văn A

Khu vực           Match
Ngành             Match
Workload          Tốt
SLA               Tốt
Conversion        Cao
```

---

## 14. Execution History

Đặt phía dưới Canvas hoặc mở drawer lớn.

### Filter

```txt
Tất cả
Thành công
Cần xem xét
Lỗi
```

### Row

```txt
06:08:12

Nguyễn Minh An
THPT Châu Văn Liêm

→ Nguyễn Văn A

Match
92%

✓ Thành công
```

Ví dụ exception:

```txt
06:06:21

Phạm Minh Khang

Không thể tự động phân công

Lý do
Không có Sale đạt minimum score.

⚠ Cần xem xét

[Xử lý]
```

---

## 15. Automation Health

Không cần card lớn.

Có thể đặt compact trên header:

```txt
94% Tự động
98.7% Thành công
3 Cần xem xét
1.8s Thời gian xử lý TB
```

Các số này chỉ hiển thị khi backend có dữ liệu thật.

---

## 16. Human-in-the-loop

Hệ thống phải thể hiện rõ:

```txt
Automation
    ↓
Không chắc chắn
    ↓
Lead Sale Review
    ↓
Phân công thủ công / override
```

Lead Sale có thể:

- Chấp nhận đề xuất.
- Chọn Sale khác.
- Ghi lý do override.
- Retry automation.
- Bổ sung dữ liệu nếu thiếu.

---

## 17. Read-only mặc định

### Mode mặc định

```txt
Xem luồng
```

Lead Sale:

- Không kéo node.
- Không xóa node.
- Không nối edge.
- Không sửa rule trực tiếp trên canvas.

Mục tiêu:

> Quan sát và hiểu automation.

Nếu tương lai cần chỉnh rule:

```txt
[Chỉnh luồng]
```

phải là một mode riêng.

---

## 18. Interaction

### Hover node

Show:

```txt
Tên node
Trạng thái
Số lượt hôm nay
```

### Click node

Mở detail panel.

### Click edge

Có thể show:

```txt
34 lượt đi qua nhánh này
```

### Click execution

Highlight đường đi của execution đó:

```txt
Học sinh mới
→ Check
→ Score
→ Assign
→ NBA
```

Các node đã đi qua sáng lên.

Đây là interaction rất "wow".

---

## 19. Execution Replay

Optional nhưng rất đáng làm.

Khi chọn:

```txt
Nguyễn Minh An · 06:08
```

bấm:

```txt
[Xem luồng xử lý]
```

Canvas highlight tuần tự:

```txt
1. Học sinh mới
2. Kiểm tra dữ liệu
3. Phân loại
4. Chấm điểm
5. Chọn Nguyễn Văn A
6. Phân công
7. Tạo NBA
```

Không cần replay quá nhanh hoặc flashy.

---

## 20. Layout chi tiết

```txt
┌──────────────────────────────────────────────────────────────┐
│ Tự động phân công                                          │
│ Theo dõi cách hệ thống phân bổ học sinh cho đội Sales.     │
│                                                            │
│ ● Đang hoạt động  | 94% tự động | 3 cần xem xét           │
│                                      [Lịch sử]             │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┬─────────────────┐
│                                            │ NODE DETAIL     │
│                                            │                 │
│ [Học sinh mới]                             │ Chấm điểm Sale  │
│       │                                    │                 │
│       ▼                                    │ ● Active        │
│ [Kiểm tra dữ liệu]                         │                 │
│       │                                    │ 34 processed    │
│       ▼                                    │                 │
│ [Phân loại]                                │ RULES           │
│       │                                    │ Khu vực   30%   │
│       ▼                                    │ Ngành     25%   │
│ [Chấm điểm Sale]                           │ Workload  20%   │
│       │                                    │ ...             │
│       ▼                                    │                 │
│ [Có Sale phù hợp?]                         │                 │
│    │           │                           │                 │
│   Có        Không                          │                 │
│    │           │                           │                 │
│    ▼           ▼                           │                 │
│ [Auto]    [Lead Review]                    │                 │
│    │                                       │                 │
│    ▼                                       │                 │
│ [Create NBA]                               │                 │
│                                            │                 │
└────────────────────────────────────────────┴─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Lịch sử phân công                                           │
│                                                            │
│ [Tất cả] [Thành công] [Cần xem xét] [Lỗi]                 │
│                                                            │
│ 06:08 Nguyễn Minh An → Nguyễn Văn A       92%     ✓        │
│ 06:07 Trần Ngọc Mai → Lê Thanh B          87%     ✓        │
│ 06:06 Phạm Minh Khang → Lead Review                ⚠        │
└──────────────────────────────────────────────────────────────┘
```

---

## 21. Responsive

### Desktop ≥ 1280px

```txt
Canvas + Detail Panel
```

### Tablet

Detail Panel dùng drawer bên phải.

### Mobile

Không nên render workflow canvas đầy đủ.

Thay bằng vertical execution flow:

```txt
Học sinh mới
   ↓
Kiểm tra
   ↓
Chấm điểm
   ↓
Phân công
```

---

## 22. Design principles

### Principle 1 — Show, don't tell

Không ghi:

> "Hệ thống có khả năng tự động phân công."

Phải cho thấy:

```txt
Học sinh mới → Rules → Scoring → Assigned
```

---

### Principle 2 — Explainable automation

Không để automation thành black box.

Lead Sale phải xem được:

```txt
Ai được chọn?
Vì sao được chọn?
Ai không được chọn?
Rule nào tác động?
```

---

### Principle 3 — Exception first

Lead Sale không cần quan tâm 100 case automation chạy đúng.

Lead Sale cần đặc biệt thấy:

```txt
3 cần xem xét
2 thiếu dữ liệu
1 lỗi
```

---

### Principle 4 — Read-only first

Không biến Lead Sale thành kỹ sư workflow.

Canvas là:

```txt
Visualization + Monitoring + Explainability
```

Không phải:

```txt
Low-code automation builder
```

---

### Principle 5 — Minimal animation

Animation dùng để chứng minh workflow đang sống.

Không dùng để trang trí.

---

## 23. Component structure

```txt
AssignmentAutomationPage

├── AutomationHeader
│   ├── AutomationStatus
│   ├── AutomationMetrics
│   └── HeaderActions
│
├── WorkflowWorkspace
│   ├── AssignmentFlowCanvas
│   │   ├── StudentInputNode
│   │   ├── ValidationNode
│   │   ├── ClassificationNode
│   │   ├── ScoringNode
│   │   ├── ConditionNode
│   │   ├── AssignmentNode
│   │   ├── HumanReviewNode
│   │   └── NextBestActionNode
│   │
│   └── NodeDetailPanel
│
└── ExecutionHistory
    ├── ExecutionFilters
    ├── ExecutionRow
    └── ExecutionDetailDrawer
```

---

## 24. React Flow node types

```ts
const nodeTypes = {
  studentInput: StudentInputNode,
  validation: ValidationNode,
  classification: ClassificationNode,
  scoring: ScoringNode,
  condition: ConditionNode,
  assignment: AssignmentNode,
  humanReview: HumanReviewNode,
  nextBestAction: NextBestActionNode,
};
```

---

## 25. Suggested data model

```ts
type WorkflowNodeStatus =
  | "idle"
  | "running"
  | "success"
  | "warning"
  | "error";

interface AssignmentWorkflowNodeData {
  title: string;
  description?: string;
  status: WorkflowNodeStatus;

  processedCount?: number;
  successCount?: number;
  warningCount?: number;
  errorCount?: number;

  metrics?: {
    label: string;
    value: string | number;
  }[];
}
```

Execution:

```ts
interface AssignmentExecution {
  id: string;

  student: {
    id: string;
    name: string;
    school?: string;
  };

  status:
    | "success"
    | "review_required"
    | "error";

  selectedSale?: {
    id: string;
    name: string;
    matchScore?: number;
  };

  reasons?: string[];

  startedAt: string;
  completedAt?: string;
}
```

---

## 26. UX states

### Loading

Skeleton node, không spinner toàn màn hình.

### Empty

```txt
Chưa có lượt phân công nào hôm nay.
```

Canvas workflow vẫn phải hiển thị.

### Workflow disabled

```txt
○ Automation đang tạm dừng
```

### Error

Highlight node lỗi và cho:

```txt
[Xem chi tiết]
[Thử lại]
```

---

## 27. Acceptance Criteria

### AC01 — Workflow visibility

Lead Sale nhìn thấy đầy đủ luồng tự động phân công.

### AC02 — Status

Mỗi node hiển thị được trạng thái.

### AC03 — Execution count

Các node quan trọng hiển thị số lượt đã xử lý.

### AC04 — Explainability

Có thể xem lý do hệ thống chọn một Sale.

### AC05 — Human review

Các trường hợp không thể tự động phân phải được đưa vào queue xem xét.

### AC06 — History

Có lịch sử các lần phân công.

### AC07 — Filtering

History filter được theo:

- Tất cả.
- Thành công.
- Cần xem xét.
- Lỗi.

### AC08 — Execution inspection

Click execution xem được:

- Học sinh.
- Sale được chọn.
- Match score.
- Lý do.
- Thời gian.
- Kết quả.

### AC09 — Read-only

Lead Sale không chỉnh topology workflow trong mode mặc định.

### AC10 — Performance

Canvas không giật khi hiển thị workflow và execution highlight.

---

## 28. Không nên làm

Không:

- Tạo quá nhiều node.
- Dùng workflow dài 20–30 bước.
- Cho Lead Sale edit rule ngay từ phiên bản đầu.
- Hiển thị thuật toán/backend technical detail.
- Dùng nhiều gradient/neon.
- Animation liên tục.
- Dùng canvas để thay thế execution history.
- Giấu exception trong menu phụ.

---

## 29. MVP

Phiên bản đầu tiên chỉ cần:

```txt
Header
+
React Flow Canvas
+
7–8 node
+
Node Detail
+
Explain Assignment
+
Exception Branch
+
Execution History
```

Chưa cần:

```txt
Workflow Editor
Versioning
Draft/Publish
Node Marketplace
Complex branching
Custom code
```

---

## 30. Định hướng visual cuối cùng

Cảm giác mong muốn:

```txt
n8n
+
Modern CRM
+
AI-native
+
Enterprise
```

Không phải clone n8n.

Điểm "wow" nằm ở:

1. Workflow trực quan.
2. Edge animation vừa đủ.
3. Dữ liệu thật trên từng node.
4. Highlight execution.
5. Giải thích lý do phân công.
6. Human-in-the-loop rõ ràng.
7. Exception nổi bật.

---

## 31. User story chính

```txt
Là Lead Sale,

tôi muốn nhìn thấy luồng tự động phân công học sinh,

để tôi hiểu hệ thống đang phân học sinh cho đội Sales như thế nào,

biết vì sao một Sale được chọn,

và nhanh chóng can thiệp khi automation không thể tự quyết định.
```

---

## 32. Kết luận

Màn hình **Tự động phân công** không nên là một CRUD screen.

Nó nên được thiết kế như một **Automation Control Center**:

```txt
Input
  ↓
Rules
  ↓
Scoring
  ↓
Decision
  ↓
Assignment
  ↓
Next Best Action
```

Lead Sale nhìn vào phải nhận ra ngay:

> Hệ thống đang tự chạy, logic rõ ràng, có thể giải thích, và chỉ yêu cầu con người can thiệp khi thật sự cần.
