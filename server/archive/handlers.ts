import type {
  ArchiveGameCommand,
  ArchiveGameData,
  ArchiveCommandResult,
  GenerateReviewDraftCommand,
  ArchiveListQuery,
  ArchiveRepository,
  ResetAfterArchiveCommand,
  ResetAfterArchiveData,
  ReviewDraftData,
  ReviewDraftProvider,
} from './types'
import { generateFakeReviewDraft } from './reviewDraft'

function archiveIdForCommand(sessionId: string, commandId: string) {
  return `archive-${sessionId}-${commandId}`
}

interface ArchiveHandlerOptions {
  reviewDraftProvider?: ReviewDraftProvider
}

function providerFailureWarning(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error
    ? String((error as { code: unknown }).code)
    : 'UNKNOWN'
  return `provider_failed:${code}`
}

export function createArchiveHandlers(repository: ArchiveRepository, options: ArchiveHandlerOptions = {}) {
  return {
    async archiveGame(command: ArchiveGameCommand): Promise<ArchiveCommandResult<ArchiveGameData>> {
      const archiveId = archiveIdForCommand(command.sessionId, command.commandId)
      const existing = await repository.get(archiveId)
      if (existing) {
        return {
          accepted: true,
          data: {
            archive: existing,
            archives: await repository.list(),
            resetUnlocked: true,
          },
          warnings: [],
        }
      }

      const archive = {
        ...command.archive,
        id: archiveId,
        sessionId: command.sessionId,
        schemaVersion: 1 as const,
      }
      const archives = await repository.save(archive)
      return {
        accepted: true,
        data: { archive, archives, resetUnlocked: true },
        warnings: [],
      }
    },

    async listArchives(query?: ArchiveListQuery) {
      return repository.list(query)
    },

    async getArchive(archiveId: string) {
      return repository.get(archiveId)
    },

    async resetAfterArchive(command: ResetAfterArchiveCommand): Promise<ArchiveCommandResult<ResetAfterArchiveData>> {
      if (!command.confirmReset) return { accepted: false, error: 'RESET_NOT_CONFIRMED', warnings: [] }
      const archive = await repository.get(command.archiveId)
      if (!archive) return { accepted: false, error: 'ARCHIVE_NOT_FOUND', warnings: [] }
      if (archive.sessionId !== command.sessionId) return { accepted: false, error: 'SESSION_MISMATCH', warnings: [] }
      return {
        accepted: true,
        data: { archiveId: archive.id, resetAllowed: true },
        warnings: [],
      }
    },

    async generateReviewDraft(command: GenerateReviewDraftCommand): Promise<ArchiveCommandResult<ReviewDraftData>> {
      const archive = await repository.get(command.archiveId)
      if (!archive) return { accepted: false, error: 'ARCHIVE_NOT_FOUND', warnings: [] }
      if (options.reviewDraftProvider) {
        try {
          const result = await options.reviewDraftProvider.generateReviewDraft(archive, {
            reviewStyle: command.reviewStyle,
            includePlayerScores: command.includePlayerScores,
          })
          return {
            accepted: true,
            data: { draft: result.draft },
            warnings: result.warnings ?? ['provider_review_draft', 'draft_only'],
          }
        } catch (error) {
          return {
            accepted: true,
            data: {
              draft: generateFakeReviewDraft(archive, {
                reviewStyle: command.reviewStyle,
                includePlayerScores: command.includePlayerScores,
              }),
            },
            warnings: ['fake_review_draft', providerFailureWarning(error), 'log_only_not_player_skill'],
          }
        }
      }
      return {
        accepted: true,
        data: {
          draft: generateFakeReviewDraft(archive, {
            reviewStyle: command.reviewStyle,
            includePlayerScores: command.includePlayerScores,
          }),
        },
        warnings: ['fake_review_draft', 'log_only_not_player_skill'],
      }
    },
  }
}
