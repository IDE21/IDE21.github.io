// Used only at build time: renders the page to HTML so search engines and link previews see the content.
import React from "react";
import { renderToString } from "react-dom/server";
import { Portfolio } from "./app.jsx";

export function render(lang) {
  return renderToString(<Portfolio initialLang={lang} />);
}
