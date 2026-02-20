import { DomainError } from '~/shared/kernel/errors'

export type UserProfileEntity = {
  name: string | null
  avatarUrl: string | null
}

export function normalizeUserProfile(input: {
  name: string | null
  avatarUrl: string | null
}): UserProfileEntity {
  const normalizedName = input.name?.trim() || null
  const normalizedAvatar = input.avatarUrl?.trim() || null

  if (normalizedName && normalizedName.length > 100) {
    throw new DomainError('Name is too long', 'PROFILE_NAME_TOO_LONG')
  }

  if (normalizedAvatar) {
    try {
      // Validate URL format in domain to preserve invariant consistency.
      new URL(normalizedAvatar)
    } catch {
      throw new DomainError(
        'Avatar URL is invalid',
        'PROFILE_AVATAR_URL_INVALID',
      )
    }
  }

  return {
    name: normalizedName,
    avatarUrl: normalizedAvatar,
  }
}
