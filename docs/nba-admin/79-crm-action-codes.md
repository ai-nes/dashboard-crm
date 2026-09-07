# 79 mã hành động CRM

Tài liệu này liệt kê 79 mã hành động canonical của CRM. Danh sách được lấy theo
`crm.fcrm.action_type_catalog.ACTION_TYPE_CATALOG` trong backend `frappe-crm`.

## Quy ước

- `code` là mã kỹ thuật duy nhất và không nên đổi sau khi đã được sử dụng.
- `display_name` là tên hiển thị cho người dùng.
- `category` là nhóm nghiệp vụ của action.
- Trên task item, `actionCode` được ưu tiên hiển thị trong badge vì đây là loại
  task. Nếu task cũ chưa có `actionCode`, UI fallback về loại task legacy như
  `Cuộc gọi`, `Email` hoặc `Việc cần làm`.

## Tổng quan theo nhóm

| Nhóm          |  Số mã | Mục đích                                         |
| ------------- | -----: | ------------------------------------------------ |
| `CONTACT`     |      8 | Liên hệ trực tiếp hoặc điều phối người phụ trách |
| `INFORMATION` |     11 | Cung cấp thông tin phục vụ quyết định            |
| `ENGAGEMENT`  |     10 | Tạo tương tác và mời tham gia hoạt động          |
| `APPLICATION` |      9 | Hỗ trợ và thúc đẩy tiến trình hồ sơ              |
| `CONVERSION`  |     11 | Hỗ trợ quyết định đăng ký/nhập học               |
| `PARENT`      |      8 | Tương tác với phụ huynh hoặc người quyết định    |
| `RECOVERY`    |     10 | Kết nối lại và xử lý lead đang chững lại         |
| `INTERNAL`    |     12 | Tác vụ vận hành nội bộ CRM                       |
| **Tổng cộng** | **79** |                                                  |

## 1. CONTACT: Liên hệ

|   # | Action code           | Tên hiển thị       | Mô tả                                                                                            |
| --: | --------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
|   1 | `CALL`                | Gọi điện           | Gọi trực tiếp cho học sinh hoặc người liên hệ để tư vấn, xác minh nhu cầu hoặc cập nhật tiến độ. |
|   2 | `SEND_ZALO`           | Nhắn tin Zalo      | Nhắn tin cho lead qua Zalo theo nội dung phù hợp.                                                |
|   3 | `SEND_EMAIL`          | Gửi email          | Gửi email để cung cấp thông tin hoặc liên hệ lại với hồ sơ.                                      |
|   4 | `SEND_SMS`            | Gửi tin nhắn SMS   | Gửi tin nhắn SMS để thông báo hoặc nhắc việc.                                                    |
|   5 | `VIDEO_CALL`          | Gọi video          | Tổ chức buổi tư vấn trực tuyến có hình ảnh khi cần trao đổi sâu hơn.                             |
|   6 | `CALL_BACK`           | Gọi lại            | Gọi lại theo yêu cầu hoặc sau khi cuộc gọi trước chưa hoàn tất.                                  |
|   7 | `REASSIGN_ADVISOR`    | Đổi tư vấn viên    | Đổi người tư vấn đang phụ trách hồ sơ.                                                           |
|   8 | `ESCALATE_SUPERVISOR` | Chuyển lên quản lý | Chuyển hồ sơ lên quản lý để xử lý hoặc quyết định.                                               |

## 2. INFORMATION: Cung cấp thông tin

|   # | Action code             | Tên hiển thị               | Mô tả                                                                                    |
| --: | ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
|   9 | `SEND_MAJOR_INFO`       | Gửi thông tin ngành        | Gửi thông tin tổng quan về ngành học mà học sinh quan tâm.                               |
|  10 | `SEND_PROGRAM_INFO`     | Gửi thông tin chương trình | Gửi nội dung về chương trình đào tạo, lộ trình học và cấu trúc chương trình.             |
|  11 | `SEND_TUITION_INFO`     | Gửi thông tin học phí      | Gửi mức học phí, các khoản liên quan và cách thanh toán.                                 |
|  12 | `SEND_SCHOLARSHIP_INFO` | Gửi thông tin học bổng     | Gửi điều kiện, giá trị và quy trình đăng ký học bổng.                                    |
|  13 | `SEND_PROMOTION_INFO`   | Gửi thông tin ưu đãi       | Gửi các chính sách ưu đãi hoặc hỗ trợ đang áp dụng.                                      |
|  14 | `SEND_ADMISSION_INFO`   | Gửi thông tin tuyển sinh   | Gửi điều kiện, phương thức và mốc thời gian tuyển sinh.                                  |
|  15 | `SEND_DORM_INFO`        | Gửi thông tin ký túc xá    | Gửi thông tin về ký túc xá, chi phí, tiện ích và đăng ký chỗ ở.                          |
|  16 | `SEND_CAREER_INFO`      | Gửi thông tin nghề nghiệp  | Gửi thông tin về cơ hội nghề nghiệp, vị trí việc làm và hướng phát triển sau tốt nghiệp. |
|  17 | `SEND_BROCHURE`         | Gửi tài liệu giới thiệu    | Gửi tài liệu giới thiệu trường hoặc chương trình.                                        |
|  18 | `SEND_MAJOR_VIDEO`      | Gửi video giới thiệu ngành | Gửi video giới thiệu ngành học.                                                          |
|  19 | `SEND_RELEVANT_FAQ`     | Gửi câu hỏi thường gặp     | Gửi các câu hỏi thường gặp theo mối quan tâm của hồ sơ.                                  |

## 3. ENGAGEMENT: Tăng tương tác

|   # | Action code                 | Tên hiển thị             | Mô tả                                                                   |
| --: | --------------------------- | ------------------------ | ----------------------------------------------------------------------- |
|  20 | `INVITE_OPEN_DAY`           | Mời ngày hội tuyển sinh  | Mời học sinh dự ngày hội tuyển sinh.                                    |
|  21 | `INVITE_CAMPUS_TOUR`        | Mời tham quan cơ sở      | Mời học sinh hoặc phụ huynh tham quan cơ sở.                            |
|  22 | `INVITE_WEBINAR`            | Mời hội thảo trực tuyến  | Mời tham dự hội thảo trực tuyến phù hợp.                                |
|  23 | `INVITE_WORKSHOP`           | Mời hội thảo             | Mời tham dự buổi hội thảo chuyên đề.                                    |
|  24 | `INVITE_CLASS_EXPERIENCE`   | Mời trải nghiệm lớp học  | Mời học sinh tham dự một buổi học thử hoặc trải nghiệm lớp học thực tế. |
|  25 | `INVITE_STEM_EVENT`         | Mời sự kiện STEM         | Mời tham dự hoạt động hoặc sự kiện STEM phù hợp với mối quan tâm.       |
|  26 | `INVITE_MOCK_TEST`          | Mời thi thử              | Mời tham gia kỳ thi thử hoặc bài đánh giá năng lực.                     |
|  27 | `BOOK_1ON1_CONSULTATION`    | Đặt lịch tư vấn riêng    | Đặt một buổi tư vấn riêng với học sinh.                                 |
|  28 | `SEND_PERSONALIZED_CONTENT` | Gửi nội dung phù hợp     | Gửi nội dung được chọn theo nhu cầu của hồ sơ.                          |
|  29 | `SEND_TESTIMONIAL`          | Gửi câu chuyện sinh viên | Gửi câu chuyện, trải nghiệm hoặc lời chứng thực của sinh viên phù hợp.  |

## 4. APPLICATION: Hồ sơ ứng tuyển

|   # | Action code                    | Tên hiển thị             | Mô tả                                                                   |
| --: | ------------------------------ | ------------------------ | ----------------------------------------------------------------------- |
|  30 | `REMIND_APPLICATION`           | Nhắc nộp hồ sơ           | Nhắc học sinh bắt đầu hoặc gửi hồ sơ đăng ký.                           |
|  31 | `REMIND_COMPLETE_APPLICATION`  | Nhắc hoàn tất hồ sơ      | Nhắc hoàn thiện các bước còn thiếu để hồ sơ có thể được xử lý.          |
|  32 | `REQUEST_MISSING_DOCUMENT`     | Yêu cầu bổ sung giấy tờ  | Yêu cầu bổ sung giấy tờ hoặc thông tin còn thiếu.                       |
|  33 | `GUIDE_NEXT_STEP`              | Hướng dẫn bước tiếp theo | Hướng dẫn rõ thao tác tiếp theo cần thực hiện trong quy trình hồ sơ.    |
|  34 | `CHECK_APPLICATION`            | Kiểm tra hồ sơ           | Kiểm tra tình trạng, tính đầy đủ hoặc tính hợp lệ của hồ sơ.            |
|  35 | `SEND_APPLICATION_CHECKLIST`   | Gửi danh sách hồ sơ      | Gửi danh sách giấy tờ và việc cần chuẩn bị.                             |
|  36 | `REMIND_APPLICATION_DEADLINE`  | Nhắc hạn hồ sơ           | Nhắc mốc thời hạn nộp hoặc hoàn thiện hồ sơ.                            |
|  37 | `ASSIST_APPLICATION_FEE`       | Hỗ trợ lệ phí hồ sơ      | Hướng dẫn hoặc hỗ trợ xử lý lệ phí hồ sơ.                               |
|  38 | `CONFIRM_APPLICATION_RECEIVED` | Xác nhận đã nhận hồ sơ   | Xác nhận hồ sơ đã được tiếp nhận và thông báo trạng thái xử lý ban đầu. |

## 5. CONVERSION: Thúc đẩy quyết định

|   # | Action code                  | Tên hiển thị              | Mô tả                                                                       |
| --: | ---------------------------- | ------------------------- | --------------------------------------------------------------------------- |
|  39 | `ADVISE_MAJOR`               | Tư vấn chọn ngành         | Tư vấn lựa chọn ngành dựa trên sở thích, năng lực và mục tiêu của học sinh. |
|  40 | `ADVISE_TUITION`             | Tư vấn học phí            | Giải thích chi phí học tập và giúp hồ sơ hiểu phương án tài chính.          |
|  41 | `ADVISE_SCHOLARSHIP`         | Tư vấn học bổng           | Tư vấn loại học bổng phù hợp và cách tăng khả năng đủ điều kiện.            |
|  42 | `ADVISE_CAREER`              | Tư vấn nghề nghiệp        | Kết nối lựa chọn ngành/chương trình với mục tiêu nghề nghiệp.               |
|  43 | `ADVISE_PARENT`              | Tư vấn cho phụ huynh      | Giải đáp mối quan tâm của phụ huynh về việc nhập học.                       |
|  44 | `COMPARE_MAJORS`             | So sánh ngành             | Cung cấp bảng hoặc nội dung so sánh giữa các ngành mà hồ sơ đang cân nhắc.  |
|  45 | `COMPARE_CAMPUSES`           | So sánh cơ sở             | Cung cấp thông tin so sánh giữa các cơ sở đào tạo.                          |
|  46 | `SEND_OFFER`                 | Gửi đề nghị nhập học      | Gửi đề nghị nhập học và các quyền lợi đi kèm.                               |
|  47 | `REMIND_ENROLLMENT_DEADLINE` | Nhắc hạn nhập học         | Nhắc thời hạn xác nhận hoặc hoàn tất thủ tục nhập học.                      |
|  48 | `INVITE_CAMPUS_VISIT`        | Mời đến tham quan cơ sở   | Mời hồ sơ đến tham quan cơ sở hoặc gặp tư vấn viên.                         |
|  49 | `ESCALATE_HIGH_INTENT`       | Chuyển lead tiềm năng cao | Chuyển hồ sơ có khả năng đăng ký cao cho người phù hợp.                     |

## 6. PARENT: Phụ huynh

|   # | Action code                | Tên hiển thị                            | Mô tả                                                                                 |
| --: | -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
|  50 | `CONTACT_PARENT`           | Liên hệ phụ huynh                       | Chủ động liên hệ phụ huynh để trao đổi về nhu cầu, tiến độ hoặc quyết định của hồ sơ. |
|  51 | `SEND_PARENT_TUITION`      | Gửi thông tin học phí cho phụ huynh     | Gửi thông tin học phí và phương án thanh toán đến phụ huynh.                          |
|  52 | `SEND_PARENT_SCHOLARSHIP`  | Gửi thông tin học bổng cho phụ huynh    | Gửi chính sách và điều kiện học bổng đến phụ huynh.                                   |
|  53 | `SEND_TRAINING_ROADMAP`    | Gửi lộ trình đào tạo                    | Gửi lộ trình học tập để phụ huynh hiểu các giai đoạn đào tạo.                         |
|  54 | `SEND_PARENT_CAREER_INFO`  | Gửi thông tin nghề nghiệp cho phụ huynh | Gửi thông tin đầu ra, nghề nghiệp và cơ hội phát triển sau chương trình.              |
|  55 | `INVITE_PARENT_EVENT`      | Mời phụ huynh dự sự kiện                | Mời phụ huynh dự sự kiện tư vấn hoặc kết nối.                                         |
|  56 | `BOOK_PARENT_CONSULTATION` | Đặt lịch với phụ huynh                  | Đặt lịch trao đổi với phụ huynh và tư vấn viên.                                       |
|  57 | `SEND_FINANCIAL_PLAN`      | Gửi kế hoạch tài chính                  | Gửi phương án dự toán và kế hoạch chi trả phù hợp với gia đình.                       |

## 7. RECOVERY: Tái kết nối

|   # | Action code               | Tên hiển thị                    | Mô tả                                                                         |
| --: | ------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
|  58 | `FOLLOW_UP_SILENT_LEAD`   | Liên hệ lại lead chưa phản hồi  | Liên hệ lại với lead đã lâu chưa phản hồi.                                    |
|  59 | `REENGAGE_LEAD`           | Kết nối lại với lead            | Bắt đầu lại cuộc trao đổi với lead đang ngừng tương tác.                      |
|  60 | `ASK_DECISION_REASON`     | Hỏi lý do chưa quyết định       | Tìm hiểu nguyên nhân khiến hồ sơ chưa đưa ra quyết định tiếp theo.            |
|  61 | `SEND_OBJECTION_CONTENT`  | Gửi nội dung xử lý phản đối     | Gửi thông tin hoặc bằng chứng để giải đáp một phản đối cụ thể.                |
|  62 | `ESCALATE_TO_SENIOR`      | Chuyển tư vấn viên cấp cao      | Chuyển hồ sơ cần kinh nghiệm hoặc kỹ năng xử lý chuyên sâu hơn.               |
|  63 | `SCHEDULE_LATER_FOLLOWUP` | Hẹn liên hệ lại                 | Hẹn thời điểm phù hợp để liên hệ lại.                                         |
|  64 | `ADD_TO_NURTURE`          | Đưa vào chuỗi chăm sóc          | Đưa hồ sơ vào chuỗi chăm sóc theo từng giai đoạn.                             |
|  65 | `MARK_NOT_READY`          | Đánh dấu chưa sẵn sàng          | Ghi nhận hồ sơ hiện chưa đủ điều kiện hoặc chưa sẵn sàng cho bước chuyển đổi. |
|  66 | `MARK_LOST`               | Đánh dấu không tiếp tục         | Ghi nhận hồ sơ không tiếp tục theo đuổi.                                      |
|  67 | `ACTIVATE_WINBACK`        | Khôi phục tương tác với lead cũ | Liên hệ lại với lead cũ để đưa họ trở lại quá trình tư vấn.                   |

## 8. INTERNAL: Vận hành nội bộ

|   # | Action code                 | Tên hiển thị                | Mô tả                                                                  |
| --: | --------------------------- | --------------------------- | ---------------------------------------------------------------------- |
|  68 | `CREATE_TASK`               | Tạo task                    | Task do người dùng tạo để theo dõi một việc cụ thể.                    |
|  69 | `ASSIGN_LEAD`               | Giao lead                   | Giao lead cho người hoặc nhóm phụ trách.                               |
|  70 | `REASSIGN_LEAD`             | Chuyển người phụ trách lead | Đổi người hoặc nhóm đang phụ trách lead.                               |
|  71 | `CREATE_REMINDER`           | Tạo nhắc việc               | Tạo lời nhắc cho một mốc hoặc hành động cần thực hiện trong tương lai. |
|  72 | `CREATE_APPOINTMENT`        | Tạo lịch hẹn                | Tạo lịch hẹn giữa hồ sơ và người phụ trách hoặc nhóm tư vấn.           |
|  73 | `CREATE_CAMPAIGN`           | Tạo chiến dịch              | Tạo chiến dịch cho một nhóm hồ sơ hoặc mục tiêu.                       |
|  74 | `UPDATE_LEAD_STATUS`        | Cập nhật trạng thái lead    | Cập nhật trạng thái nghiệp vụ của lead theo kết quả xử lý mới nhất.    |
|  75 | `UPDATE_LEAD_SCORE`         | Cập nhật điểm tiềm năng     | Cập nhật điểm tiềm năng của lead.                                      |
|  76 | `ADD_TAG`                   | Gắn nhãn                    | Gắn nhãn để phân loại và theo dõi hồ sơ.                               |
|  77 | `CREATE_NOTE`               | Thêm ghi chú                | Thêm ghi chú vào hồ sơ.                                                |
|  78 | `ESCALATE_CASE`             | Chuyển hồ sơ xử lý          | Chuyển hồ sơ hoặc vụ việc sang người phụ trách khác.                   |
|  79 | `REQUEST_SUPERVISOR_REVIEW` | Yêu cầu quản lý xem xét     | Gửi yêu cầu để quản lý xem xét hướng xử lý.                            |

## Hiển thị trên task item

Badge loại task nên hiển thị tên tiếng Việt ngắn của action. Mã canonical chỉ
dùng làm định danh kỹ thuật và được giữ trong tooltip để tra cứu:

```tsx
<StudentTaskTypeBadge actionCode={task.actionCode} taskType={task.taskType} />
```

Ví dụ:

| Dữ liệu                                    | Badge hiển thị                    |
| ------------------------------------------ | --------------------------------- |
| `actionCode = "CALL_BACK"`                 | `Gọi lại`                         |
| `actionCode = "SEND_TUITION_INFO"`         | `Gửi thông tin học phí`           |
| `actionCode = "ACTIVATE_WINBACK"`          | `Khôi phục tương tác với lead cũ` |
| Không có `actionCode`, `taskType = "call"` | `Cuộc gọi`                        |
