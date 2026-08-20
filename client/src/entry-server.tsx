import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import App from "./App";
import { trpc } from "./lib/trpc";
import { metadataForPath, type PageMetadata } from "./seo";

export function render(url: string): { html: string; head: PageMetadata } {
  const questionIndex = url.indexOf("?");
  const ssrPath = questionIndex === -1 ? url : url.slice(0, questionIndex);
  const ssrSearch = questionIndex === -1 ? "" : url.slice(questionIndex + 1);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "http://127.0.0.1/api/trpc", transformer: superjson })] });
  const html = renderToString(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router ssrPath={ssrPath} ssrSearch={ssrSearch}><App /></Router>
      </QueryClientProvider>
    </trpc.Provider>,
  );
  return { html, head: metadataForPath(ssrPath) };
}
