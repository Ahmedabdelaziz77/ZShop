"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useUser from "../hooks/useUser";
import { WebSocketProvider } from "../context/web-socket-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
    </QueryClientProvider>
  );
}

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return (
    <>
      {user && <WebSocketProvider user={user}>{children}</WebSocketProvider>}
      {!user && children}
    </>
  );
};
