type Data = unknown[] | Record<string, unknown>
type SupabaseError = { message: string; hint: string }

class SupabaseResponse {
  public data: null | Data
  public error: null | SupabaseError
  constructor({ data, error }: { data?: Data; error?: SupabaseError }) {
    this.data = data ?? null
    this.error = error ?? null
  }
}

export default SupabaseResponse
