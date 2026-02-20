import { DomainError } from '~/shared/kernel/errors'

export const MATERIAL_TYPES = ['plastic', 'glass', 'paper', 'metal'] as const
export type MaterialType = (typeof MATERIAL_TYPES)[number]

export function isMaterialType(input: unknown): input is MaterialType {
  return (
    typeof input === 'string' && MATERIAL_TYPES.includes(input as MaterialType)
  )
}

export function toMaterialType(input: unknown): MaterialType {
  if (!isMaterialType(input)) {
    throw new DomainError('Invalid material type', 'INVALID_MATERIAL_TYPE', {
      input,
    })
  }

  return input
}
