// ============================================
// src/pages/_app.tsx (Next.js Pages Router App Wrapper)
// ============================================
// Global app wrapper: Initializes TanStack Query with QueryClientProvider to fix

import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional: npm i @tanstack/react-query-devtools
import { useState } from 'react';
import '../styles/globals.css'; // Your global styles (unchanged)

// Root app component with QueryClientProvider
export default function App({ Component, pageProps }: AppProps) {
  // Create singleton QueryClient with production defaults (stable across renders)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Query defaults: Balance caching with freshness
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min cache for stability (e.g., notifications)
            gcTime: 10 * 60 * 1000, // Garbage collection after 10 min (Next.js gcTime)
            retry: (failureCount, error) => {
              // Custom retry: Skip on auth errors (401/403) to avoid loops
              if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
                return false;
              }
              return failureCount < 3; // Retry up to 3 times otherwise
            },
          },
          // Mutation defaults: No auto-retry (handle manually in hooks)
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      {/* DevTools: Enable in development for query inspection/caching debug */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}