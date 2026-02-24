/**
 * Maps raw Supabase auth error messages to user-friendly Portuguese strings.
 *
 * Keeps domain logic pure — no side effects, no UI calls.
 */
export function mapAuthError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : ''

  const lower = message.toLowerCase()

  // ── Email already registered ──
  if (
    lower.includes('already registered') ||
    lower.includes('already been registered') ||
    lower.includes('user already registered')
  ) {
    return 'Este email já está registado. Tente iniciar sessão.'
  }

  // ── Duplicate / existing user (Supabase may return this) ──
  if (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('already exists')
  ) {
    return 'Este email já está associado a uma conta.'
  }

  // ── Weak password ──
  if (
    lower.includes('password') &&
    (lower.includes('weak') ||
      lower.includes('short') ||
      lower.includes('at least'))
  ) {
    return 'A palavra-passe é demasiado fraca. Use pelo menos 6 caracteres.'
  }

  // ── Invalid credentials (login) ──
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials')
  ) {
    return 'Email ou palavra-passe incorretos.'
  }

  // ── Email not confirmed ──
  if (lower.includes('email not confirmed')) {
    return 'O seu email ainda não foi confirmado. Verifique a sua caixa de correio.'
  }

  // ── Rate limiting ──
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('429')
  ) {
    return 'Demasiadas tentativas. Aguarde um momento e tente novamente.'
  }

  // ── Network / fetch errors ──
  if (
    lower.includes('fetch') ||
    lower.includes('network') ||
    lower.includes('failed to fetch')
  ) {
    return 'Erro de ligação. Verifique a sua internet e tente novamente.'
  }

  // ── Passwords don't match (local validation) ──
  if (lower.includes('palavras-passe não coincidem')) {
    return 'As palavras-passe não coincidem.'
  }

  // ── Fallback ──
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
}

/**
 * Validates registration fields and returns an error message,
 * or `undefined` if all fields are valid.
 */
export function validateRegistrationFields(fields: {
  name: string
  email: string
  password: string
  confirm: string
}): string | undefined {
  if (!fields.name.trim()) {
    return 'Preencha o nome completo.'
  }
  if (!fields.email.trim()) {
    return 'Preencha o email.'
  }
  if (!fields.password) {
    return 'Preencha a palavra-passe.'
  }
  if (fields.password.length < 6) {
    return 'A palavra-passe deve ter pelo menos 6 caracteres.'
  }
  if (fields.password !== fields.confirm) {
    return 'As palavras-passe não coincidem.'
  }
  return undefined
}

/**
 * Validates login fields and returns an error message,
 * or `undefined` if valid.
 */
export function validateLoginFields(fields: {
  email: string
  password: string
}): string | undefined {
  if (!fields.email.trim()) {
    return 'Preencha o email.'
  }
  if (!fields.password) {
    return 'Preencha a palavra-passe.'
  }
  return undefined
}
