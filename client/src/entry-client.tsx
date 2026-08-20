import { hydrateRoot, createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  const tree = <Router><App /></Router>;
  if (root.hasChildNodes()) hydrateRoot(root, tree);
  else createRoot(root).render(tree);
}
