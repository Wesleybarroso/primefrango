import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import { metadataForPath, type PageMetadata } from "./seo";

export function render(url: string): { html: string; head: PageMetadata } {
  const questionIndex = url.indexOf("?");
  const ssrPath = questionIndex === -1 ? url : url.slice(0, questionIndex);
  const ssrSearch = questionIndex === -1 ? "" : url.slice(questionIndex + 1);
  const html = renderToString(<Router ssrPath={ssrPath} ssrSearch={ssrSearch}><App /></Router>);
  return { html, head: metadataForPath(ssrPath) };
}
