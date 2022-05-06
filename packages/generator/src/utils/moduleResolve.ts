export const moduleResolve = (mod: string): string | null => {
  try {
    return require.resolve(mod)
  } catch (_) {
    return null
  }
}
