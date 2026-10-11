# Techcombank notification capture

One flow: Techcombank notification → Exodo Capture → Exodo Sync → Exodo API → Supabase.

## Phone

Keep one Techcombank notification automation. Pass its original notification directly to Exodo Capture; remove the two-item List and source-extraction actions. In Capture, set `source_app` to the literal `techcombank`, map available notification fields, generate an event ID once, and save one local JSON file. After Save File, run Exodo Sync.

Sync sends pending files to the single deployed endpoint below. Preserve each file and its original event ID on failures. Delete only after HTTP success and a matching event ID with actual boolean `accepted: true` and `durable: true`. Keep deletion disabled until those device-side guards are verified. Connectivity returning alone does not start Sync; the next captured notification does. A notification the phone never supplies cannot be captured.

## Deploy

1. Apply [the original SQL migration](../supabase-notification-captures-migration.sql), then [the type column migration](../supabase-notification-captures-type-migration.sql) in your existing Supabase SQL editor before deploying the updated receiver. Existing rows default to `notification`; their saved payloads remain unchanged.
2. Set these variables in your existing Exodo hosting environment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EXODO_SHORTCUT_USER_ID` — your Clerk user ID
   - `EXODO_SHORTCUT_TEST_TOKEN` — the same receiver token used by Sync
3. Redeploy Exodo through its existing Next.js deployment workflow.
4. Set Sync's URL to `https://YOUR_EXODO_DOMAIN/api/notifications/capture`, method POST, and header `Authorization: Bearer YOUR_TOKEN`. Choose JSON request body. Keep database credentials on the server.

This exact route authenticates the bearer token instead of requiring a Clerk browser session. Other application routes retain their existing protection. Hosting deployment protection must also permit requests from the phone. There is no separate receiver process, port, tunnel, or receipt-only mode.

## Payload

```json
{
  "version": 1,
  "type": "notification",
  "event_id": "synthetic-capture-001",
  "device_id": "iphone01",
  "source_app": "techcombank",
  "title": "Synthetic notification",
  "subtitle": "",
  "message": "Synthetic delivery test",
  "captured_at": "2026-10-11T10:00:00+07:00"
}
```

Version accepts `1` or `"1"` and normalizes to `1`. Event ID, device ID, source, and capture time must be nonempty strings; there are no identifier patterns or timestamp-format checks. Continue sending ISO 8601 from the phone. Missing/null title, subtitle, and message become empty strings. Other supplied text types are rejected. Extra fields are ignored. Body limit: 64 KiB. Ownership comes from the server setting, not the payload.

`type` accepts only `notification` or `mail`; omitted type defaults to `notification` so existing queued files still work. Add `type` with text value `notification` to both Capture's saved Dictionary and Sync's JSON request body. The table stores the normalized type in its own column and in new JSON payloads. Type is part of payload comparison: changing it for an existing event returns a conflict. Accepting `mail` does not add Gmail ingestion or email parsing.

## Verify and debug

Send the synthetic payload above. Confirm the stored row in `notification_captures` and this response:

```json
{"event_id":"synthetic-capture-001","accepted":true,"durable":true}
```

Resend the same payload: one row must remain. A retry with changed content under the same owner/device/event identity returns `409 event_conflict`; the original row stays unchanged. Storage failures return `503 storage_failed` and never authorize deletion. Missing configuration returns `503 receiver_not_configured`; wrong token returns `401`; invalid fields return `400`; wrong content type returns `415`; oversized bodies return `413`.

Hosting logs include request IDs, detailed rejection reasons, and authenticated raw bodies capped at 64 KiB. Authorization headers stay hidden. The response's `X-Request-ID` matches its log entries.

Finally test a real notification, then a failed upload followed by retry on the next capture. The user reports Capture and Sync working; offline recovery, lock/restart behavior, and safe deletion still require device verification. Full notification coverage is not guaranteed. Transaction parsing, Gmail capture, and additional banks are deferred.
