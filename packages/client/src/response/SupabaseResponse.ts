type Data = unknown[] | Record<string, unknown>
type SupabaseError = {
  message: string
  hint: string | null
  code?: string
  details?: string
}

class SupabaseResponse {
  public data: null | Data
  public error: null | SupabaseError
  constructor({
    data,
    error,
  }: {
    data?: SupabaseResponse['data']
    error?: SupabaseResponse['error']
  }) {
    this.data = data ?? null
    this.error = error ?? null
  }
}

export default SupabaseResponse
