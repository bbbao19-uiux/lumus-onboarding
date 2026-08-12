// Watch the Figma DTCG token sources and regenerate on every change.
//   node design-system/watch.mjs
// Edit design-system/figma-tokens/*.tokens.json -> colors.css + tokens.json
// are rebuilt automatically. A page polling tokens.json (see tokens-runtime.js)
// then updates its colors live — no manual build, no redeploy.
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('design-system/figma-tokens');
const BUILD = path.resolve('design-system/build-from-tokens.mjs');

let building = false, queued = false;
function build() {
  if (building) { queued = true; return; }
  building = true;
  const p = spawn(process.execPath, [BUILD], { stdio: 'inherit' });
  p.on('close', () => {
    building = false;
    if (queued) { queued = false; build(); }
  });
}

build();
let t;
fs.watch(SRC, { recursive: false }, (_e, file) => {
  clearTimeout(t);
  t = setTimeout(() => { console.log(`\n↻ change: ${file} — rebuilding…`); build(); }, 150);
});
console.log(`👀 Watching ${SRC}\n   Edit a *.tokens.json to auto-rebuild colors.css + tokens.json.`);
