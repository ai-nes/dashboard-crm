# Campaign channel type API

## List campaign channel types

```http
GET /api/method/crm.api.campaign_channel_type.list_campaign_channel_types
```

The endpoint uses the authenticated user's read permission for
`CRM Campaign Channel Type`. It returns the seeded channel type catalog in
display order.

Query parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `ONLINE \| OFFLINE` | — | Only return types that support the selected mode. |
| `search` | string | — | Search by code, display name, or description. |
| `enabled_only` | boolean | `true` | Exclude disabled values when true. |
| `start` | integer | `0` | Offset pagination. |
| `page_length` | integer | `100` | Page size. |

Response:

```json
{
  "message": {
    "total": 24,
    "start": 0,
    "page_length": 100,
    "channel_types": [
      {
        "code": "EXPERIENCE_DAY",
        "display_name": "Experience Day",
        "is_online": 0,
        "is_offline": 1,
        "enabled": 1,
        "sort_order": 140,
        "modes": ["OFFLINE"]
      }
    ]
  }
}
```

The dashboard calls this endpoint through
`getCampaignChannelTypes()` and passes the response to the campaign channel
dropdowns. The UI does not fall back to a hardcoded option list when the API
fails.
