/* Локальный предпросмотр сохранённой копии: node dev-server.js 4321
   Отдаёт чистые URL и 404 так же, как .htaccess на хостинге.
   Это файл для разработчика, на прод его не кладут. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.argv[2] || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json'
};

/* Те же плоские файлы под чистыми URL, что делает .htaccess на хостинге */
const ALIAS = [
  [/^\/cases\/(\d+)$/, m => 'case-' + m[1] + '.html'],
  [/^\/subscribe\/(\w+)$/, m => 'subscribe-' + m[1] + '.html'],
  [/^\/checklist\/thanks$/, () => 'checklist-thanks.html'],
  [/^\/lp\/(\w+)$/, m => 'lp-' + m[1] + '.html']
];

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, url);

  const send = (p, code = 200) => {
    const ext = path.extname(p).toLowerCase();
    res.writeHead(code, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(p).pipe(res);
  };

  if (url !== '/' && !url.endsWith('/')) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(file);
    if (fs.existsSync(file + '.html')) return send(file + '.html');
    for (const [re, fn] of ALIAS) {
      const m = url.match(re);
      if (m) {
        const alias = path.join(ROOT, fn(m));
        if (fs.existsSync(alias)) return send(alias);
      }
    }
  } else if (url === '/' || fs.existsSync(path.join(file, 'index.html'))) {
    const idx = path.join(file, 'index.html');
    if (fs.existsSync(idx)) return send(idx);
  }

  // 404 — отдаём страницу сайта, как это сделает хостинг
  const notFound = path.join(ROOT, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
    return fs.createReadStream(notFound).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
}).listen(PORT, () => console.log('http://localhost:' + PORT));
