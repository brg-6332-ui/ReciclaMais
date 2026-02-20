export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code = 'APPLICATION_ERROR',
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApplicationError'
  }
}
