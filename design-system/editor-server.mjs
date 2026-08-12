// Static server + token save endpoint for the design-system editor.
//   node design-system/editor-server.mjs   ->  http://localhost:8100/design-system/index.html
// Serves the project folder AND accepts POST /api/save-tokens to write tokens.json
// (so the editor's "Lưu vào file" persists to the real source). Optionally runs
// the DTCG build afterwards to keep colors.css in sync.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ROOT = path.resolve('.');
const PORT = 8100;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2' };

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/save-tokens') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        JSON.parse(body);                                   // validate
        fs.writeFileSync(path.join(ROOT, 'design-system/tokens.json'), body);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"ok":true}');
        console.log('✓ saved design-system/tokens.json (' + body.length + ' bytes)');
      } catch (e) {
        res.writeHead(400); res.end('bad json: ' + e.message);
      }
    });
    return;
  }
  // static
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/design-system/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log(`Editor server: http://localhost:${PORT}/design-system/index.html\n  POST /api/save-tokens -> writes design-system/tokens.json`));
