import { randomUUID } from 'node:crypto'
import { MAX_CAPTURE_BYTES } from './contract'
import { createCaptureStore } from './capture-store'
import { hasCaptureAuthorization, isCaptureCredential, receiveCapture, type CaptureResult } from './receive-capture'

export async function handleCaptureRequest(request: Request): Promise<Response> {
  const requestId = randomUUID()
  const startedAt = Date.now()
  let bytesRead = 0
  const respond = ({ status, body, details }: CaptureResult) => {
    if (status >= 400)
      console.error(
        '[shortcuts-receiver]',
        JSON.stringify({
          request_id: requestId,
          status,
          error: body.error,
          method: request.method,
          route: 'capture',
          bytes_read: bytesRead,
          elapsed_ms: Date.now() - startedAt,
          authorization_present: Boolean(request.headers.get('authorization')),
          bearer_scheme: request.headers.get('authorization')?.startsWith('Bearer ') ?? false,
          json_content_type:
            request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() === 'application/json',
          ...details,
        }),
      )
    return Response.json(body, {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Request-ID': requestId,
        ...(status === 401 ? { 'WWW-Authenticate': 'Bearer' } : {}),
      },
    })
  }
  const reject = (status: number, error: string, details: object = {}) =>
    respond({
      status,
      body: { accepted: false, durable: false, error },
      details,
    })
  const credential = process.env.EXODO_SHORTCUT_TEST_TOKEN
  const userId = process.env.EXODO_SHORTCUT_USER_ID
  if (
    !isCaptureCredential(credential) ||
    !userId?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return reject(503, 'receiver_not_configured', {
      stage: 'configuration',
      hint: 'Configure receiver token, Clerk owner ID, Supabase URL, and service-role key on the server',
    })
  }
  if (!hasCaptureAuthorization(request.headers.get('authorization'), credential)) {
    return reject(401, 'unauthorized', {
      hint: 'Authorization must be Bearer followed by the configured receiver token',
    })
  }

  const chunks: Uint8Array[] = []
  let retainedBytes = 0
  let complete = false
  let readFailed = false
  const reader = request.body?.getReader()
  try {
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytesRead += value.byteLength
        const remaining = MAX_CAPTURE_BYTES - retainedBytes
        if (remaining > 0) {
          const kept = value.slice(0, remaining)
          chunks.push(kept)
          retainedBytes += kept.byteLength
        }
        if (bytesRead > MAX_CAPTURE_BYTES) {
          await reader.cancel()
          break
        }
      }
    }
    complete = bytesRead <= MAX_CAPTURE_BYTES
  } catch {
    readFailed = true
  } finally {
    reader?.releaseLock()
  }
  const bytes = Buffer.concat(chunks)
  console.error(
    '[shortcuts-receiver]',
    JSON.stringify({
      request_id: requestId,
      event: 'request_body',
      body: bytes.toString('utf8'),
      bytes_received: bytesRead,
      truncated: bytesRead > MAX_CAPTURE_BYTES,
      complete,
    }),
  )
  if (readFailed) return reject(400, 'request_failed', { stage: 'body_read' })
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reject(415, 'unsupported_media_type', { expected_content_type: 'application/json' })
  }
  if (bytesRead > MAX_CAPTURE_BYTES) return reject(413, 'payload_too_large', { max_bytes: MAX_CAPTURE_BYTES })
  try {
    return respond(await receiveCapture(bytes, createCaptureStore(userId)))
  } catch {
    return reject(503, 'storage_failed', { stage: 'persistence' })
  }
}
