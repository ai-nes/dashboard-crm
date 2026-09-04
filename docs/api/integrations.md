# API lấy trạng thái Integration

API dùng cho dashboard để lấy các integration theo `type`. Hiện hỗ trợ hai
type: `call` và `zalo`.

## Endpoint

```http
GET {FRAPPE_URL}/api/method/crm.integrations.api.get_integrations
```

Ví dụ local:

```http
GET http://localhost:8000/api/method/crm.integrations.api.get_integrations?type=call
Accept: application/json
Cookie: sid=<session-cookie>
```

API dùng session cookie Frappe hoặc API token. Không gửi request body và response
không bao gồm API key, token hay secret của provider.

## Request

| Query  | Kiểu           | Bắt buộc | Mô tả                                                                                       |
| ------ | -------------- | -------: | ------------------------------------------------------------------------------------------- |
| `type` | `call \| zalo` |    Không | Bỏ trống để lấy cả hai type; truyền `call` để lấy Twilio/Exotel hoặc `zalo` để lấy Zalo OA. |

### Lấy tất cả integration

```http
GET /api/method/crm.integrations.api.get_integrations
```

### Lọc type `call`

```http
GET /api/method/crm.integrations.api.get_integrations?type=call
```

### Lọc type `zalo`

```http
GET /api/method/crm.integrations.api.get_integrations?type=zalo
```

## Response `200 OK`

Frappe trả payload trong `message`:

```json
{
  "message": {
    "data": [
      {
        "type": "call",
        "provider": "twilio",
        "label": "Twilio",
        "enabled": true,
        "status": "enabled"
      },
      {
        "type": "call",
        "provider": "exotel",
        "label": "Exotel",
        "enabled": false,
        "status": "disabled"
      },
      {
        "type": "zalo",
        "provider": "zalo_oa",
        "label": "Zalo OA",
        "enabled": false,
        "status": "not_configured"
      }
    ],
    "meta": {
      "requested_type": null,
      "returned_types": ["call", "zalo"],
      "total": 3
    }
  }
}
```

### Field contract

| Field                 | Kiểu                                    | Mô tả                                                    |
| --------------------- | --------------------------------------- | -------------------------------------------------------- |
| `data[].type`         | `call \| zalo`                          | Nhóm integration.                                        |
| `data[].provider`     | `string`                                | Provider key ổn định: `twilio`, `exotel` hoặc `zalo_oa`. |
| `data[].label`        | `string`                                | Tên hiển thị.                                            |
| `data[].enabled`      | `boolean`                               | Provider có được bật hay không.                          |
| `data[].status`       | `enabled \| disabled \| not_configured` | Trạng thái cấu hình.                                     |
| `meta.requested_type` | `string \| null`                        | Filter đã nhận; `null` nếu lấy tất cả.                   |
| `meta.returned_types` | `string[]`                              | Các type xuất hiện trong `data`.                         |
| `meta.total`          | `integer`                               | Tổng số provider trả về.                                 |

### Quy tắc dữ liệu

- `call` đọc `Twilio Settings.enabled` và `Exotel Settings.enabled`.
- `zalo` đọc single DocType `Zalo Settings.enabled` nếu site đã cài DocType này.
- Khi chưa có `Zalo Settings`, API vẫn trả item `zalo` với `enabled: false` và
  `status: "not_configured"`.

## Response lỗi

### `417 Expectation Failed` — type không được hỗ trợ

```http
GET /api/method/crm.integrations.api.get_integrations?type=email
```

```json
{
  "exc_type": "ValidationError",
  "message": "Unsupported integration type: email. Use 'call' or 'zalo'."
}
```

## Typed client trong dashboard

```ts
import { getIntegrations } from "@/services/api/integrations";

const all = await getIntegrations();
const calls = await getIntegrations({ type: "call" });
const zalo = await getIntegrations({ type: "zalo" });
```
