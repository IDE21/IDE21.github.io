import React from "react";
import { createRoot } from "react-dom/client";
import { Portfolio } from "./app.jsx";

createRoot(document.getElementById("root")).render(<Portfolio />);

// Optional visitor counter: GoatCounter needs no cookies. Turned on by links.goatcounter in content.js.
const gc = window.SITE.links.goatcounter;
if (gc) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = "https://" + gc + ".goatcounter.com/count";
  document.head.appendChild(s);
}
