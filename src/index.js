const http = require('http');
const fs = require('fs');
const staticP = require('./static');

const PORT = 3030;
const getFile = staticP.file(staticP.dir('../tpath/'));

const router = (request, response) => {
  const [, file, range] = request.url.split('/');
  const [start, end] = range.split('-').map(Number);
  const fpath = getFile(file);

  fs.stat(fpath, (err, stats) => {
    const fstream = fs.createReadStream(fpath, { start, end });

    response.writeHead(206, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Content-Length': end - start + 1,
    });
    fstream.pipe(response);
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
