# Campaign channel type API

## List campaign channel types

```http
GET /api/v1/campaign-channel-types
```

Returns the channel type catalog in display order for users who may read it.

Query parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `ONLINE \| OFFLINE` | — | Only types that support the selected mode. |
| `search` | string | — | Search by code, display name or description. |
| `enabledOnly` | boolean | `true` | Exclude disabled values when true. |
| `start` | integer | `0` | Offset pagination. |
| `pageLength` | integer | `100` | Page size. |

Response:

```json
{
  "channelTypes": [
    {
      "code": "EXPERIENCE_DAY",
      "displayName": "Experience Day",
      "modes": ["OFFLINE"],
      "enabled": true,
      "sortOrder": 140,
      "description": ""
    }
  ],
  "total": 24
}
```

## Write endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/campaign-channel-types` | Create. |
| `PATCH` | `/api/v1/campaign-channel-types/{code}` | Update; the code never changes. |
| `DELETE` | `/api/v1/campaign-channel-types/{code}` | Answers `{ deleted }`. |

The dashboard calls the list through `getCampaignChannelTypes()` and feeds the
campaign channel dropdowns. The UI does not fall back to a hardcoded list when
the API fails.