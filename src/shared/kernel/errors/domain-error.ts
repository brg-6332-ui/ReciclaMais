export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code = 'DOMAIN_ERROR',
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}
