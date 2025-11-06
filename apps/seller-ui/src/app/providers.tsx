"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useSeller from "../hooks/useSeller";
import { WebSocketProvider } from "../context/web-socket-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
    </QueryClientProvider>
  );
}

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { seller } = useSeller();
  return (
    <>
      {seller && (
        <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
      )}
      {!seller && children}
    </>
  );
};
