export interface MessageTemplateItem {
  id: string
  title: string
  description: string
  subject: string
  body: string
}

export interface MessageTemplateGroup {
  id: string
  title: string
  templates: MessageTemplateItem[]
}

export const messageTemplateGroups: MessageTemplateGroup[] = [
  {
    id: 'first-touch',
    title: 'Tiếp cận ban đầu',
    templates: [
      {
        id: 'first-contact',
        title: 'Liên hệ lần đầu',
        description: 'Mở đầu cuộc trò chuyện với học sinh mới.',
        subject: 'Chào {{student.first_name}}, anh/chị là tư vấn viên từ {{school.name}}',
        body: `Chào {{student.first_name}},

Anh/chị là {{owner.full_name}}, tư vấn viên tuyển sinh từ {{school.name}}.
Anh/chị liên hệ để hỗ trợ em tìm hiểu thêm về chương trình đào tạo, ngành học, học phí và các thông tin tuyển sinh phù hợp với nhu cầu của em.
Nếu thuận tiện, em có thể phản hồi lại tin nhắn này hoặc cho anh/chị biết thời gian phù hợp để trao đổi nhé.

Trân trọng,
{{owner.full_name}}
{{owner.phone}}`,
      },
      {
        id: 'event-form-content-lead',
        title: 'Lead từ sự kiện / form / nội dung',
        description: 'Tiếp cận lead sau khi để lại thông tin.',
        subject: 'Chào {{student.first_name}}, cảm ơn em đã quan tâm đến {{school.name}}',
        body: `Chào {{student.first_name}},

Anh/chị thấy em đã để lại thông tin qua {{lead.source}} của {{school.name}}.
Anh/chị gửi em thêm một số thông tin về chương trình tuyển sinh mà em đang quan tâm.
Nếu em có câu hỏi hoặc muốn được tư vấn thêm, em cứ phản hồi lại tin nhắn này nhé.

Trân trọng,
{{owner.full_name}}
{{owner.phone}}`,
      },
      {
        id: 'suitable-program',
        title: 'Giới thiệu chương trình phù hợp',
        description: 'Gợi ý chương trình theo nhu cầu của học sinh.',
        subject: 'Chương trình {{program.name}} có thể phù hợp với em',
        body: `Chào {{student.first_name}},

Dựa trên thông tin em đang quan tâm, anh/chị muốn giới thiệu đến em chương trình {{program.name}} tại {{school.name}}.
Chương trình này phù hợp với những bạn quan tâm đến {{program.interest_area}} và mong muốn phát triển theo hướng {{program.career_direction}}.
Em có thể xem thêm tại: {{program.link}}
Nếu em muốn, anh/chị có thể tư vấn thêm để xem chương trình này có phù hợp với định hướng của em không.`,
      },
    ],
  },
  {
    id: 'follow-up',
    title: 'Theo dõi sau liên hệ',
    templates: [
      {
        id: 'no-answer',
        title: 'Không bắt máy',
        description: 'Gửi lại thông tin sau khi chưa kết nối được.',
        subject: 'Anh/chị vừa liên hệ với em',
        body: `Chào {{student.first_name}},

Anh/chị vừa liên hệ với em để trao đổi một số thông tin về tuyển sinh tại {{school.name}}, nhưng chưa kết nối được với em.
Khi thuận tiện, em có thể phản hồi lại tin nhắn này hoặc liên hệ với anh/chị qua số {{owner.phone}}.
Anh/chị rất sẵn sàng hỗ trợ em.

Trân trọng,
{{owner.full_name}}`,
      },
      {
        id: 'follow-up-after-consultation',
        title: 'Follow-up sau tư vấn',
        description: 'Tóm tắt và nhắc lại thông tin sau buổi tư vấn.',
        subject: 'Thông tin sau buổi tư vấn tại {{school.name}}',
        body: `Chào {{student.first_name}},

Cảm ơn em đã dành thời gian trao đổi cùng anh/chị.
Dựa trên nội dung mình vừa trao đổi, em đang quan tâm đến {{program.name}} và muốn tìm hiểu thêm về lộ trình học, học phí cũng như cơ hội học bổng.
Anh/chị gửi lại thông tin để em tiện tham khảo.
Nếu em còn câu hỏi nào khác, cứ phản hồi lại tin nhắn này nhé.

Trân trọng,
{{owner.full_name}}`,
      },
      {
        id: 'continue-conversation',
        title: 'Tiếp tục cuộc trò chuyện',
        description: 'Mở lại cuộc trao đổi chưa đi sâu vào nhu cầu.',
        subject: 'Anh/chị muốn trao đổi thêm với em',
        body: `Chào {{student.first_name}},

Trong lần trao đổi trước, mình chưa có nhiều thời gian để tìm hiểu kỹ về nhu cầu và định hướng của em.
Anh/chị muốn trao đổi thêm để hỗ trợ em tốt hơn về ngành học, học phí, học bổng và kế hoạch tuyển sinh.
Khi thuận tiện, em có thể phản hồi lại tin nhắn này nhé.`,
      },
      {
        id: 'confirm-next-step',
        title: 'Xác nhận bước tiếp theo',
        description: 'Xác nhận hành động tiếp theo trong quy trình.',
        subject: 'Bước tiếp theo của em tại {{school.name}}',
        body: `Chào {{student.first_name}},

Dựa trên thông tin hiện tại, bước tiếp theo em cần thực hiện là:
{{application.next_step}}
Em có thể thực hiện tại: {{application.link}}
Nếu cần hỗ trợ trong quá trình thực hiện, anh/chị sẽ đồng hành cùng em.`,
      },
      {
        id: 'response-reminder',
        title: 'Nhắc phản hồi',
        description: 'Nhắc nhẹ học sinh phản hồi thông tin đã nhận.',
        subject: 'Em đã xem thông tin anh/chị gửi chưa?',
        body: `Chào {{student.first_name}},

Anh/chị muốn hỏi em đã có thời gian xem những thông tin về {{student.interested_program}} mà anh/chị gửi trước đó chưa.
Nếu em vẫn đang cân nhắc hoặc còn câu hỏi về chương trình học, học phí, học bổng hay hồ sơ tuyển sinh, anh/chị rất sẵn sàng hỗ trợ.
Em cứ phản hồi lại khi thuận tiện nhé.`,
      },
    ],
  },
  {
    id: 'admission-consultation',
    title: 'Tư vấn tuyển sinh',
    templates: [
      {
        id: 'program-information',
        title: 'Thông tin ngành / chương trình',
        description: 'Gửi thông tin tổng quan về chương trình học.',
        subject: 'Thông tin về {{program.name}}',
        body: `Chào {{student.first_name}},

Theo nội dung em đang quan tâm, anh/chị gửi em một số thông tin về chương trình {{program.name}} tại {{school.name}}.
Em có thể tìm hiểu thêm về:
- Nội dung chương trình học
- Thời gian đào tạo
- Cơ hội nghề nghiệp
- Học phí
- Điều kiện tuyển sinh

Thông tin chi tiết: {{program.link}}
Nếu em muốn được tư vấn kỹ hơn về chương trình này, anh/chị có thể hỗ trợ thêm.`,
      },
      {
        id: 'tuition-scholarship',
        title: 'Học phí & học bổng',
        description: 'Giới thiệu học phí và các chính sách học bổng.',
        subject: 'Thông tin học phí và học bổng tại {{school.name}}',
        body: `Chào {{student.first_name}},

Anh/chị gửi em thông tin về học phí và các chương trình học bổng hiện đang áp dụng tại {{school.name}}.
Học phí tham khảo: {{tuition.amount}}
Chương trình học bổng: {{scholarship.name}}
Thông tin chi tiết: {{scholarship.link}}
Tùy theo hồ sơ và kết quả xét tuyển, em có thể đủ điều kiện nhận các mức hỗ trợ khác nhau.
Nếu em muốn kiểm tra điều kiện học bổng của mình, anh/chị có thể hỗ trợ.`,
      },
      {
        id: 'invite-open-day',
        title: 'Mời Open Day / sự kiện',
        description: 'Mời học sinh tham gia sự kiện tuyển sinh.',
        subject: 'Mời {{student.first_name}} tham gia {{event.name}}',
        body: `Chào {{student.first_name}},

{{school.name}} sắp tổ chức chương trình {{event.name}} dành cho các bạn học sinh đang quan tâm đến môi trường học tập và chương trình tuyển sinh.
Thời gian: {{event.datetime}}
Địa điểm: {{event.location}}
Đăng ký tham gia tại: {{event.registration_link}}

Đây là dịp để em trực tiếp tìm hiểu về chương trình học, trải nghiệm môi trường và trao đổi với đội ngũ tư vấn.
Rất mong được gặp em tại sự kiện!`,
      },
      {
        id: 'confirm-consultation',
        title: 'Xác nhận lịch tư vấn',
        description: 'Xác nhận thời gian và hình thức tư vấn.',
        subject: 'Xác nhận lịch tư vấn của {{student.first_name}}',
        body: `Chào {{student.first_name}},

Anh/chị xác nhận lịch tư vấn của em như sau:
Thời gian: {{appointment.datetime}}
Hình thức: {{appointment.type}}
Địa điểm/Link: {{appointment.location}}

Nếu em cần thay đổi thời gian, hãy phản hồi lại tin nhắn này để anh/chị hỗ trợ.
Hẹn gặp em!
{{owner.full_name}}
{{owner.phone}}`,
      },
    ],
  },
  {
    id: 'application-conversion',
    title: 'Hồ sơ & chuyển đổi',
    templates: [
      {
        id: 'complete-application',
        title: 'Nhắc hoàn thiện hồ sơ',
        description: 'Nhắc bổ sung thông tin còn thiếu trong hồ sơ.',
        subject: 'Hồ sơ tuyển sinh của em cần bổ sung thông tin',
        body: `Chào {{student.first_name}},

Anh/chị kiểm tra hồ sơ tuyển sinh của em và hiện vẫn còn một số thông tin cần bổ sung.
Thông tin cần hoàn thiện:
{{application.missing_documents}}
Em có thể hoàn thiện hồ sơ tại: {{application.link}}
Nếu gặp khó khăn trong quá trình bổ sung hồ sơ, hãy phản hồi lại tin nhắn này để anh/chị hỗ trợ.

Trân trọng,
{{owner.full_name}}`,
      },
      {
        id: 'application-received',
        title: 'Xác nhận đã nhận hồ sơ',
        description: 'Thông báo hồ sơ đã được tiếp nhận.',
        subject: '{{school.name}} đã nhận được thông tin của em',
        body: `Chào {{student.first_name}},

{{school.name}} đã nhận được thông tin đăng ký của em.
Trạng thái hiện tại: {{application.status}}
Bước tiếp theo: {{application.next_step}}
Anh/chị sẽ tiếp tục cập nhật cho em khi có thông tin mới.
Cảm ơn em đã quan tâm đến {{school.name}}.`,
      },
      {
        id: 'qualified',
        title: 'Đủ điều kiện / Qualified',
        description: 'Thông báo kết quả phù hợp và hướng xử lý tiếp theo.',
        subject: 'Cập nhật kết quả tư vấn tuyển sinh của em',
        body: `Chào {{student.first_name}},

Dựa trên thông tin hiện tại, em đang phù hợp với chương trình {{program.name}} tại {{school.name}}.
Bước tiếp theo em cần thực hiện là: {{application.next_step}}
Em có thể tiếp tục tại: {{application.link}}
Nếu cần hỗ trợ trong quá trình thực hiện, anh/chị sẽ đồng hành cùng em.`,
      },
      {
        id: 'application-next-step-guide',
        title: 'Hướng dẫn bước tiếp theo',
        description: 'Hướng dẫn học sinh hoàn tất bước tiếp theo.',
        subject: 'Hướng dẫn bước tiếp theo trong hồ sơ của em',
        body: `Chào {{student.first_name}},

Để tiếp tục quy trình tuyển sinh tại {{school.name}}, em vui lòng thực hiện bước sau:
{{application.next_step}}
Em có thể bắt đầu tại: {{application.link}}
Nếu cần hỗ trợ, em cứ phản hồi lại tin nhắn này nhé.`,
      },
    ],
  },
  {
    id: 're-engagement',
    title: 'Tái tương tác',
    templates: [
      {
        id: 'long-no-response',
        title: 'Lâu chưa phản hồi',
        description: 'Khơi lại cuộc trò chuyện sau một thời gian im lặng.',
        subject: 'Anh/chị muốn hỏi thăm em một chút',
        body: `Chào {{student.first_name}},

Đã một thời gian rồi anh/chị chưa nhận được phản hồi từ em.
Anh/chị muốn hỏi thăm xem em còn cần thêm thông tin về chương trình, học phí hoặc học bổng không.
Nếu em vẫn đang tìm hiểu, em cứ phản hồi khi thuận tiện nhé.`,
      },
      {
        id: 'reconnect',
        title: 'Tái kết nối',
        description: 'Kết nối lại với học sinh từng quan tâm.',
        subject: 'Em vẫn còn quan tâm đến {{school.name}} chứ?',
        body: `Chào {{student.first_name}},

Một thời gian rồi anh/chị chưa có dịp trao đổi lại với em.
Anh/chị muốn hỏi hiện tại em có còn quan tâm đến chương trình tuyển sinh tại {{school.name}} không.
Nếu em vẫn đang tìm hiểu, anh/chị có thể cập nhật cho em những thông tin mới nhất về ngành học, học phí, học bổng và các mốc tuyển sinh sắp tới.
Nếu em không còn nhu cầu, em cũng có thể cho anh/chị biết để anh/chị cập nhật thông tin nhé.`,
      },
      {
        id: 'close-loop',
        title: 'Close-loop / xác nhận không còn nhu cầu',
        description: 'Khép lại việc liên hệ một cách lịch sự.',
        subject: 'Xác nhận nhu cầu tư vấn tuyển sinh',
        body: `Chào {{student.first_name}},

Anh/chị đã liên hệ với em một vài lần nhưng chưa nhận được phản hồi.
Anh/chị muốn xác nhận xem em có còn nhu cầu tìm hiểu chương trình tại {{school.name}} hay không.
Nếu em vẫn quan tâm, chỉ cần phản hồi lại tin nhắn này, anh/chị sẽ tiếp tục hỗ trợ.
Nếu hiện tại em chưa có nhu cầu, anh/chị sẽ tạm dừng liên hệ để tránh làm phiền em.`,
      },
    ],
  },
]
