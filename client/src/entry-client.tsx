import { hydrateRoot, createRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import App from "./App";
import { trpc } from "./lib/trpc";
import "./index.css";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
});

const root = document.getElementById("root");
if (root) {
  const tree = <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router><App /></Router></QueryClientProvider></trpc.Provider>;
  if (root.hasChildNodes()) hydrateRoot(root, tree);
  else createRoot(root).render(tree);
}
