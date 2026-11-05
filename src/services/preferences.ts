const sessionPreferences = new Map<string, string>();

// Mantém a orientação funcional nesta sessão quando o armazenamento é bloqueado.
export function safePreference(key: string, value?: string) {
  if (value !== undefined) sessionPreferences.set(key, value);
  try {
    if (value !== undefined) localStorage.setItem(key, value);
    return localStorage.getItem(key) ?? sessionPreferences.get(key) ?? null;
  } catch {
    return sessionPreferences.get(key) ?? null;
  }
}
