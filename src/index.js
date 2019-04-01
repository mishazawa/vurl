const http = require('http');
const fs = require('fs');
const util = require('util');

const { Magic, MAGIC_MIME_TYPE } = require('mmmagic');
const staticP = require('./static');


const m = new Magic(MAGIC_MIME_TYPE);
const PORT = 3030;
const getFile = staticP.file(staticP.dir('../tpath/'));

const stat = util.promisify(fs.stat);
const mime = util.promisify(m.detectFile);

const validUri = (request, response) => {
  const [, file, range] = request.url.split('/');
  if (!file || !range) {
    response.writeHead(400);
    response.end();
    return false;
  }
  const [start, end] = range.split('-').map(Number);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    response.writeHead(400);
    response.end();
    return false;
  }
  return { file, start, end };
}

const router = (request, response) => {
  const vurl = validUri(request, response);
  if (!vurl) return;

  const fpath = getFile(vurl.file);

  m.detectFile(fpath, (err, contentType) => {
    if (err) {
      response.writeHead(404)
      return response.end();
    }

    stat(fpath).then((stats) => {
      const {start, end} = vurl;
      const fstream = fs.createReadStream(fpath, { start, end });
      response.writeHead(206, {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': end - start + 1,
      });
      fstream.pipe(response);
    }).catch((err) => {
      console.log(err)
      response.writeHead(404)
      response.end();
    });
  });
};


const runService = () => {
  const server = http.createServer(router);
  server.listen(PORT, (err) => {
    if (err) return console.log(err);
    console.log(`server is listening on ${PORT}`);
  });
};


runService();


