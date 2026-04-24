import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client.
 * Import this in main.tsx to wrap the app, and in AuthContext to call .clear() on logout.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
