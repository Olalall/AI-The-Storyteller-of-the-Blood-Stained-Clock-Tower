import type { AsyncArchiveAdapter, GameArchiveRecord } from './types'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface ArchiveApiErrorBody {
  accepted: false
  error?: {
    code?: string
    message?: string
  }
}

interface ArchiveApiListBody {
  archives?: GameArchiveRecord[]
}

interface ArchiveApiDetailBody {
  archive?: GameArchiveRecord
}

interface ArchiveApiSaveBody {
  accepted?: boolean
  data?: {
    archive?: GameArchiveRecord
    archives?: GameArchiveRecord[]
  }
}

export class ArchiveHttpError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, status: number, message = code) {
    super(message)
    this.name = 'ArchiveHttpError'
    this.code = code
    this.status = status
  }
}

export interface CreateHttpArchiveAdapterOptions {
  baseUrl?: string
  fetcher?: FetchLike
}

function archiveCommandId(record: GameArchiveRecord) {
  const prefix = `archive-${record.sessionId}-`
  return record.id.startsWith(prefix) ? record.id.slice(prefix.length) : record.id
}

function urlFor(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/$/, '')}${pathname}`
}

async function readJson(response: Response) {
  try {
    return await response.json() as unknown
  } catch {
    return null
  }
}

function errorFromBody(body: unknown, status: number) {
  const errorBody = body as ArchiveApiErrorBody | null
  const code = errorBody?.error?.code ?? 'BAD_REQUEST'
  const message = errorBody?.error?.message ?? code
  return new ArchiveHttpError(code, status, message)
}

async function requestJson(fetcher: FetchLike, input: string, init?: RequestInit) {
  const response = await fetcher(input, init)
  const body = await readJson(response)
  if (!response.ok) throw errorFromBody(body, response.status)
  return body
}

export function createHttpArchiveAdapter({
  baseUrl = '',
  fetcher = fetch,
}: CreateHttpArchiveAdapterOptions = {}): AsyncArchiveAdapter {
  return {
    async load() {
      const body = await requestJson(fetcher, urlFor(baseUrl, '/api/archives')) as ArchiveApiListBody
      return Array.isArray(body.archives) ? body.archives : []
    },

    async save(record) {
      const body = await requestJson(fetcher, urlFor(baseUrl, `/api/games/${encodeURIComponent(record.sessionId)}/archive`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: archiveCommandId(record),
          payload: { archive: record },
        }),
      }) as ArchiveApiSaveBody

      if (body.accepted !== true || !body.data?.archive || !Array.isArray(body.data.archives)) {
        throw new ArchiveHttpError('BAD_REQUEST', 502, 'Invalid archive response')
      }
      return body.data.archives
    },

    async get(archiveId) {
      try {
        const body = await requestJson(fetcher, urlFor(baseUrl, `/api/archives/${encodeURIComponent(archiveId)}`)) as ArchiveApiDetailBody
        return body.archive ?? null
      } catch (error) {
        if (error instanceof ArchiveHttpError && error.code === 'ARCHIVE_NOT_FOUND') return null
        throw error
      }
    },
  }
}

export const httpArchiveAdapter = createHttpArchiveAdapter()
