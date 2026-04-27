export function parseApiErrors(error: unknown): Record<string, string> {
  const apiError = error as {
    response?: {
      data?: {
        errors?: Record<string, string[]>;
      };
    };
  };

  const errors = apiError?.response?.data?.errors ?? {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages?.[0] ?? 'Invalid value']),
  );
}
