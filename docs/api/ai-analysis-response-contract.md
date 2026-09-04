# AI Analysis Response Contract — Student Detail & School Detail

Tài liệu này định nghĩa **response mà service AI phải trả về** để đồng bộ với
UI hiện tại của:

- `/director/students/{studentId}` — Student 360
- `/director/schools/{schoolCode}` — School 360

Contract này chỉ dành cho kết quả phân tích AI (`Analysis Run`). Thông tin hồ
sơ, KPI, timeline, hoạt động và dữ liệu gốc vẫn lấy từ các detail API hiện có:

- [Director Student Detail](./director-student-detail.md)
- [Director School Detail](./director-school-detail.md)

Không trả lại hoặc ghi đè toàn bộ `Student360Data`/`SchoolIntelligenceData`
trong response AI. UI hiện tại ghép dữ liệu detail với report của analysis run.

## 1. Quy ước response

### 1.1. Envelope

Service AI có thể trả payload trực tiếp. Khi đi qua Frappe RPC, payload được bọc
trong `message`:

```json
{
  "message": {
    "run_id": "run-student-2026-0001",
    "run_type": "CRM Student Analysis Run",
    "status": "completed",
    "stages": []
  }
}
```

UI chấp nhận cả hai dạng, nhưng các field bên trong nên dùng `snake_case` theo
wire contract dưới đây.

### 1.2. Kiểu dữ liệu bắt buộc

| Field | Kiểu | Quy tắc |
|---|---|---|
| `run_id` | `string` | Bắt buộc, ổn định trong suốt vòng đời run. |
| `run_type` | `string` | `CRM Student Analysis Run` hoặc `CRM School Analysis Run`. |
| `status` | enum | `queued`, `running`, `completed`, `abstained`, `failed`, `dead_lettered`. |
| `stages` | array | Luôn là mảng; không có stage thì trả `[]`. |
| `receipt` | `string | null` | Có ở response tạo run, không bắt buộc khi poll. |
| `source_revision` | `number | null` | Revision của dữ liệu đầu vào nếu có. |
| `source_digest` | `string | null` | Hash/snapshot của dữ liệu đầu vào nếu có. |
| `expires_at` | ISO-8601 `string | null` | Thời điểm kết quả hết hiệu lực nếu có. |
| `reused_existing_run` | `boolean` | Cho biết kết quả được tái sử dụng từ run đã có. |

`queued` và `running` là trạng thái đang xử lý. Khi đang xử lý, response vẫn
phải trả `run_id` và `stages`; stage chưa có dữ liệu phải trả `claims: []` và
`report: null`.

## 2. Stage contract

```json
{
  "name": "stage-student-360",
  "stage_kind": "student_360",
  "status": "completed",
  "claims": [],
  "report": null,
  "terminal_reason": null,
  "policy_revision": "student-360-analysis-r1",
  "model_revision": "ai-model-revision-2026-09-01"
}
```

| Field | Kiểu | Quy tắc |
|---|---|---|
| `name` | `string | null` | ID stage ổn định; có thể dùng `id` thay cho `name`. |
| `stage_kind` | enum | `student_360`, `next_best_action`, `school_360`. |
| `status` | enum | Dùng cùng enum với `run.status`. |
| `claims` | `Claim[]` | Luôn là mảng, giữ nguyên thứ tự ưu tiên do AI trả về. |
| `report` | `Report | null` | Chỉ có ở `student_360` và `school_360`; `next_best_action` luôn `null`. |
| `terminal_reason` | `string | null` | Lý do khi `abstained`, `failed` hoặc `dead_lettered`; bình thường là `null`. |
| `policy_revision` | `string | null` | Phiên bản policy dùng để phân tích. |
| `model_revision` | `string | null` | Phiên bản model dùng để phân tích. |

### Stage theo từng màn hình

| `run_type` | Các stage hợp lệ | Cách UI sử dụng |
|---|---|---|
| `CRM Student Analysis Run` | `student_360` → `next_best_action` | Report 360 lấy từ stage `student_360`; NBA lấy các claim recommendation của stage `next_best_action`. |
| `CRM School Analysis Run` | `school_360` | Report School 360 lấy từ stage `school_360`; không có NBA stage. |

## 3. Claim contract

Wire format tối thiểu:

```json
{
  "kind": "inference",
  "text": "Học sinh có mức quan tâm cao nhưng còn do dự vì học phí.",
  "provenance_ids": [
    "student:ENR-2026-0001",
    "CRM Student Interaction:INT-0008"
  ],
  "visibility": "shareable",
  "confidence": 0.86
}
```

| Field | Kiểu | Quy tắc |
|---|---|---|
| `kind` | enum | `fact`, `inference`, `uncertainty`, `recommendation`. |
| `text` | `string` | Nội dung claim dùng để hiển thị trong drawer. Không trả chuỗi rỗng. |
| `provenance_ids` | `string[]` | ID nguồn đối soát; không dùng tên nguồn không ổn định nếu có ID bản ghi. Có thể là `[]` khi không có nguồn hiển thị. |
| `visibility` | enum | `shareable` hoặc `source_scoped`. |
| `confidence` | `number | null` | **Khoảng `0..1`**, không phải `0..100`; `null` nếu không đánh giá được. |

`next_best_action.claims` phải có `kind: "recommendation"`. Thứ tự trong mảng
là thứ tự ưu tiên từ cao xuống thấp; nên trả từ 1 đến 3 action. Không cần field
`rank` riêng.

`provenance_ids` phải trỏ tới nguồn mà người xem được phép đối soát. Không đưa
PII, prompt nội bộ, chain-of-thought hoặc nội dung nguồn bị giới hạn quyền vào
`text`.

## 4. Report contract

```json
{
  "title": "Ưu tiên xử lý rào cản học phí",
  "summary": "Học sinh đã thể hiện sự quan tâm rõ ràng đến ngành học nhưng chưa hoàn tất bước tiếp theo vì cần phương án tài chính cụ thể.",
  "risks": [
    {
      "kind": "risk",
      "headline": "Chưa có phương án học phí được xác nhận",
      "detail": "Phụ huynh đã hỏi về học bổng nhưng chưa có lịch tư vấn tiếp theo được ghi nhận.",
      "confidence": 0.91,
      "provenance_ids": ["CRM Student Interaction:INT-0008"]
    }
  ],
  "recommendations": [
    {
      "kind": "recommendation",
      "headline": "Gọi phụ huynh để tư vấn học bổng",
      "detail": "Chuẩn bị phương án học phí theo kỳ và điều kiện học bổng trước khung giờ liên hệ phù hợp.",
      "confidence": 0.88,
      "provenance_ids": [
        "CRM Student Interaction:INT-0008",
        "CRM Student Assessment:ASSESS-0001"
      ]
    },
    {
      "kind": "opportunity",
      "headline": "Mở hồ sơ đăng ký sau khi chốt phương án tài chính",
      "detail": "Mức độ quan tâm hiện tại là cơ sở để chuyển sang bước mở hồ sơ nếu rào cản học phí được giải quyết.",
      "confidence": 0.74,
      "provenance_ids": ["student:ENR-2026-0001"]
    }
  ],
  "missing_evidence": [
    "Xác nhận ngân sách học phí của gia đình",
    "Thời điểm dự kiến hoàn tất hồ sơ"
  ]
}
```

| Field | Kiểu | Quy tắc |
|---|---|---|
| `title` | `string | null` | Tiêu đề ngắn, dùng cho “Đánh giá trọng tâm”/“Ưu tiên chiến lược”. |
| `summary` | `string | null` | Một đoạn tóm tắt có căn cứ; dùng ở card tổng quan và card hành trình. |
| `risks` | `ReportItem[]` | Rào cản/rủi ro, giữ thứ tự ưu tiên. Có thể là `[]`. |
| `recommendations` | `ReportItem[]` | Bao gồm item `recommendation` và `opportunity`, giữ nguyên thứ tự AI trả về. Có thể là `[]`. |
| `missing_evidence` | `string[]` | Dữ liệu còn thiếu hoặc cần xác minh; luôn trả `[]` nếu không có. |

`ReportItem` dùng shape:

```json
{
  "kind": "recommendation",
  "headline": "Xác nhận lịch làm việc với Ban giám hiệu",
  "detail": "Gửi lại đề xuất lịch trước lần liên hệ tiếp theo.",
  "confidence": 0.83,
  "provenance_ids": ["CRM School Activity:ACT-0012"]
}
```

Quy tắc `ReportItem`:

- `kind` là `risk`, `recommendation` hoặc `opportunity`.
- `headline` là câu ngắn, nói thẳng vấn đề hoặc việc cần làm.
- `detail` giải thích vì sao, dựa trên evidence; không viết suy đoán như dữ kiện chắc chắn.
- `confidence` dùng `0..1` hoặc `null`.
- `provenance_ids` là mảng, không được bỏ field.

## 5. JSON response hoàn chỉnh — Student 360

Đây là response thành công tối thiểu nhưng đủ để UI hiện tại render các phần:
report tổng quan, rào cản, tín hiệu thuận lợi, drawer claims và NBA.

```json
{
  "run_id": "run-student-2026-0001",
  "run_type": "CRM Student Analysis Run",
  "status": "completed",
  "receipt": "receipt-student-2026-0001",
  "source_revision": 42,
  "source_digest": "sha256:student-0001-rev-42",
  "expires_at": null,
  "reused_existing_run": false,
  "stages": [
    {
      "name": "stage-student-360-0001",
      "stage_kind": "student_360",
      "status": "completed",
      "claims": [
        {
          "kind": "fact",
          "text": "Học sinh đã tham gia hai điểm chạm tuyển sinh trong 30 ngày gần nhất.",
          "provenance_ids": [
            "CRM Student Interaction:INT-0007",
            "CRM Student Interaction:INT-0008"
          ],
          "visibility": "shareable",
          "confidence": 1
        },
        {
          "kind": "inference",
          "text": "Mức quan tâm cao nhưng quyết định vẫn phụ thuộc vào phương án học phí của gia đình.",
          "provenance_ids": [
            "CRM Student Assessment:ASSESS-0001",
            "CRM Student Interaction:INT-0008"
          ],
          "visibility": "shareable",
          "confidence": 0.86
        },
        {
          "kind": "uncertainty",
          "text": "Chưa đủ bằng chứng để xác nhận thời điểm gia đình sẵn sàng nộp hồ sơ.",
          "provenance_ids": ["student:ENR-2026-0001"],
          "visibility": "source_scoped",
          "confidence": null
        }
      ],
      "report": {
        "title": "Ưu tiên xử lý rào cản học phí",
        "summary": "Học sinh đã thể hiện sự quan tâm rõ ràng đến ngành học nhưng chưa hoàn tất bước tiếp theo vì cần phương án tài chính cụ thể.",
        "risks": [
          {
            "kind": "risk",
            "headline": "Chưa có phương án học phí được xác nhận",
            "detail": "Phụ huynh đã hỏi về học bổng nhưng chưa có lịch tư vấn tiếp theo được ghi nhận.",
            "confidence": 0.91,
            "provenance_ids": ["CRM Student Interaction:INT-0008"]
          }
        ],
        "recommendations": [
          {
            "kind": "recommendation",
            "headline": "Gọi phụ huynh để tư vấn học bổng",
            "detail": "Chuẩn bị phương án học phí theo kỳ và điều kiện học bổng trước khung giờ liên hệ phù hợp.",
            "confidence": 0.88,
            "provenance_ids": [
              "CRM Student Interaction:INT-0008",
              "CRM Student Assessment:ASSESS-0001"
            ]
          },
          {
            "kind": "opportunity",
            "headline": "Mở hồ sơ đăng ký sau khi chốt phương án tài chính",
            "detail": "Mức độ quan tâm hiện tại là cơ sở để chuyển sang bước mở hồ sơ nếu rào cản học phí được giải quyết.",
            "confidence": 0.74,
            "provenance_ids": ["student:ENR-2026-0001"]
          }
        ],
        "missing_evidence": [
          "Xác nhận ngân sách học phí của gia đình",
          "Thời điểm dự kiến hoàn tất hồ sơ"
        ]
      },
      "terminal_reason": null,
      "policy_revision": "student-360-analysis-r1",
      "model_revision": "ai-model-revision-2026-09-01"
    },
    {
      "name": "stage-student-nba-0001",
      "stage_kind": "next_best_action",
      "status": "completed",
      "claims": [
        {
          "kind": "recommendation",
          "text": "Gọi phụ huynh trong khung 16:00–18:00 để tư vấn học bổng và chốt một bước tiếp theo.",
          "provenance_ids": [
            "CRM Student Assessment:ASSESS-0001",
            "CRM Student Interaction:INT-0008"
          ],
          "visibility": "shareable",
          "confidence": 0.9
        },
        {
          "kind": "recommendation",
          "text": "Gửi bảng học phí theo kỳ và điều kiện học bổng sau cuộc gọi.",
          "provenance_ids": ["CRM Student Assessment:ASSESS-0001"],
          "visibility": "shareable",
          "confidence": 0.78
        }
      ],
      "report": null,
      "terminal_reason": null,
      "policy_revision": "student-next-task-v2",
      "model_revision": "ai-model-revision-2026-09-01"
    }
  ]
}
```

UI mapping cho Student 360:

| Response field | Component/UI hiện tại |
|---|---|
| `stages[].report.title` | Tiêu đề đánh giá trọng tâm. |
| `stages[].report.summary` | Tóm tắt hành trình/điểm tiềm năng. |
| `student_360.report.risks[]` | Card “Rào cản tuyển sinh”. |
| `student_360.report.recommendations[]` | Card “Tín hiệu thuận lợi”; item `opportunity` được giữ như cơ hội. |
| `next_best_action.claims[]` với `kind = recommendation` | Chuỗi việc cần làm trong card liên hệ/NBA. |
| Tất cả `claims[]` | Analysis drawer: facts, inferences, uncertainties và recommendations. |
| `missing_evidence[]` | Chi tiết evidence còn thiếu trong report/drawer. |

## 6. JSON response hoàn chỉnh — School 360

School 360 chỉ có một stage `school_360`. Không tạo `next_best_action` stage;
recommendation của trường nằm trong `report.recommendations`.

```json
{
  "run_id": "run-school-2026-0001",
  "run_type": "CRM School Analysis Run",
  "status": "completed",
  "receipt": "receipt-school-2026-0001",
  "source_revision": 18,
  "source_digest": "sha256:school-0001-rev-18",
  "expires_at": null,
  "reused_existing_run": false,
  "stages": [
    {
      "name": "stage-school-360-0001",
      "stage_kind": "school_360",
      "status": "completed",
      "claims": [
        {
          "kind": "fact",
          "text": "Trường có một đầu mối Ban giám hiệu và một hoạt động hướng nghiệp đã hoàn thành.",
          "provenance_ids": [
            "CRM School Stakeholder:STAKE-0001",
            "CRM School Activity:ACT-0011"
          ],
          "visibility": "shareable",
          "confidence": 1
        },
        {
          "kind": "inference",
          "text": "Quan hệ hiện tại tạo nền tảng phù hợp để mở rộng tiếp cận học sinh khối 12.",
          "provenance_ids": [
            "CRM School Stakeholder:STAKE-0001",
            "CRM School Activity:ACT-0011"
          ],
          "visibility": "shareable",
          "confidence": 0.82
        },
        {
          "kind": "uncertainty",
          "text": "Chưa có dữ liệu mới được xác minh về nhóm ngành học sinh khối 12 quan tâm trong kỳ hiện tại.",
          "provenance_ids": ["school:01-001-062"],
          "visibility": "source_scoped",
          "confidence": null
        }
      ],
      "report": {
        "title": "Ưu tiên phát triển quan hệ với THPT Nguyễn Du",
        "summary": "Trường có nền tảng phối hợp tốt và nên được tiếp cận bằng một hoạt động hướng nghiệp tiếp theo cho khối 12.",
        "risks": [
          {
            "kind": "risk",
            "headline": "Chưa chốt lịch hoạt động tiếp theo",
            "detail": "Nếu lịch Career Talk chưa được xác nhận, nhịp tiếp cận học sinh khối 12 có thể bị gián đoạn.",
            "confidence": 0.84,
            "provenance_ids": ["CRM School Activity:ACT-0012"]
          }
        ],
        "recommendations": [
          {
            "kind": "recommendation",
            "headline": "Xác nhận lịch Career Talk với Ban giám hiệu",
            "detail": "Gửi lại đề xuất lịch và bộ tài liệu hướng nghiệp trước lần liên hệ tiếp theo.",
            "confidence": 0.91,
            "provenance_ids": [
              "CRM School Stakeholder:STAKE-0001",
              "CRM School Activity:ACT-0012"
            ]
          },
          {
            "kind": "opportunity",
            "headline": "Mở rộng tiếp cận học sinh khối 12",
            "detail": "Hoạt động đã hoàn thành và quan hệ hiện tại tạo cơ sở để triển khai thêm một điểm chạm.",
            "confidence": 0.78,
            "provenance_ids": ["CRM School Stakeholder:STAKE-0001"]
          }
        ],
        "missing_evidence": [
          "Quy mô học sinh khối 12 được xác minh trong kỳ hiện tại",
          "Nhóm ngành được học sinh quan tâm"
        ]
      },
      "terminal_reason": null,
      "policy_revision": "school-360-analysis-r1",
      "model_revision": "ai-model-revision-2026-09-01"
    }
  ]
}
```

UI mapping cho School 360:

| Response field | Component/UI hiện tại |
|---|---|
| `school_360.report.title` | “Ưu tiên chiến lược”. |
| `school_360.report.summary` | “Đánh giá từ School 360”. |
| `school_360.report.recommendations[0]` | “Việc cần làm ngay”. |
| `school_360.report.risks[0]` | “Rào cản cần xử lý”. |
| Recommendation `kind = opportunity` | “Cơ hội phát triển” và card tín hiệu thuận lợi. |
| `missing_evidence[]` | Chi tiết dữ liệu cần bổ sung. |
| `claims[]` | Analysis drawer của School 360. |

Các KPI trường (`potentialScore`, `grade12Students`, `prospects`,
`applications`, `enrollment`, `changes`, `performance`, `dataAvailability`,
...) **không nằm trong AI analysis response**; chúng vẫn phải lấy từ School
Detail API để giữ nguyên nguồn dữ liệu và logic fallback hiện tại.

## 7. Response khi đang chạy hoặc không thể kết luận

### Đang chạy

```json
{
  "run_id": "run-school-2026-0002",
  "run_type": "CRM School Analysis Run",
  "status": "running",
  "stages": [
    {
      "name": "stage-school-360-0002",
      "stage_kind": "school_360",
      "status": "running",
      "claims": [],
      "report": null,
      "terminal_reason": null,
      "policy_revision": "school-360-analysis-r1",
      "model_revision": "ai-model-revision-2026-09-01"
    }
  ]
}
```

### Abstained vì thiếu evidence

```json
{
  "run_id": "run-school-2026-0003",
  "run_type": "CRM School Analysis Run",
  "status": "abstained",
  "stages": [
    {
      "name": "stage-school-360-0003",
      "stage_kind": "school_360",
      "status": "abstained",
      "claims": [],
      "report": {
        "title": null,
        "summary": "Chưa đủ dữ liệu được xác minh để đưa ra đánh giá School 360.",
        "risks": [],
        "recommendations": [],
        "missing_evidence": [
          "Dữ liệu quan hệ trường",
          "Lịch sử hoạt động tuyển sinh"
        ]
      },
      "terminal_reason": "insufficient_evidence",
      "policy_revision": "school-360-analysis-r1",
      "model_revision": "ai-model-revision-2026-09-01"
    }
  ]
}
```

Nếu stage `student_360` đã `completed` nhưng `next_best_action` bị
`abstained`, vẫn phải trả report Student 360 đã hoàn tất. UI có thể hiển thị
report hữu ích và thông báo NBA chưa sẵn sàng.

## 8. Tương thích field name

Frontend hiện tại đã normalize một số alias cũ, nhưng AI nên trả canonical
wire fields sau để tránh phụ thuộc vào compatibility layer:

| Canonical nên dùng | Alias đang được chấp nhận | Ghi chú |
|---|---|---|
| `run_id` | `runId` | Dùng `run_id`. |
| `run_type` | `runType`, `run_kind`, `runKind` | `run_type` phải chứa đúng tên run Frappe nếu có. |
| `stage_kind` | `stageKind` | Dùng `stage_kind`. |
| `kind` + `text` | `claim_kind` + `statement`, `claimKind` + `statement` | Claim wire nên dùng `kind`/`text`. |
| `provenance_ids` | `provenanceIds` | Luôn là array. |
| `visibility` | `visibility_label`, `visibilityLabel` | Dùng `shareable`/`source_scoped`. |
| `report` | `report_json`, `analysis_report` | `report` nên là object JSON, không phải string JSON. |
| `missing_evidence` | `missingEvidence`, `evidence_gaps` | Dùng array string. |

## 9. Checklist trước khi tích hợp

- Student trả đúng hai stage theo thứ tự: `student_360`, `next_best_action`.
- School chỉ trả một stage: `school_360`.
- `student_360.report` và `school_360.report` là object hoặc `null`.
- `next_best_action.report` luôn là `null`.
- `claims`, `risks`, `recommendations`, `missing_evidence` luôn là array.
- `confidence` của claim/report item nằm trong `0..1`, hoặc `null`.
- `recommendations[].kind` chỉ là `recommendation` hoặc `opportunity`.
- Mọi recommendation quan trọng có `provenance_ids` để UI hiển thị nguồn đối soát.
- Không biến dữ liệu thiếu thành `0`, `false`, hoặc câu khẳng định có vẻ chắc chắn.
- Không trả PII, chain-of-thought, prompt hệ thống hoặc dữ liệu vượt quyền xem.
- Không dùng response AI để thay thế KPI/raw detail data của Student 360 hoặc School 360.
