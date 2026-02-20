export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly code = 'INFRASTRUCTURE_ERROR',
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'InfrastructureError'
  }
}
