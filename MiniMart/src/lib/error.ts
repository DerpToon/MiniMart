type ErrorShape = {
  description?: unknown
  error?: unknown
  message?: unknown
}

function isErrorShape(value: unknown): value is ErrorShape {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (isErrorShape(error)) {
    const message =
      asString(error.message) ||
      asString(error.description) ||
      asString(error.error)

    if (message) return message
  }

  return fallback
}
