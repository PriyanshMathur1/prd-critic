// Copies src/critic.js into index.html between the markers, stripping `export`.
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const src = readFileSync(new URL("../src/critic.js", import.meta.url), "utf8").replace(/^export /gm, "");
const a = "/* critic.js start */", b = "/* critic.js end */";
const i = html.indexOf(a), j = html.indexOf(b);
if (i < 0 || j < 0) throw new Error("markers missing in index.html");
writeFileSync(new URL("../index.html", import.meta.url), html.slice(0, i + a.length) + "\n" + src.trim() + "\n" + html.slice(j));
console.log("synced critic.js into index.html");
