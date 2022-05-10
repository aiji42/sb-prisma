export class SBPrismaError extends Error {
  constructor(e?: string) {
    super(e)
    this.name = new.target.name

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class SBPrismaAPIError extends SBPrismaError {
  constructor(e: { message: string; [k: string]: string | null }) {
    console.error(e)
    super(e.message)
  }
}
