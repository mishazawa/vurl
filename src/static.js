const path = require('path');

const dir = (d) => {
  if (path.isAbsolute(d)) return path.normalize(d);
  return path.normalize(path.join(__dirname, d));
};

const file = p => url => path.normalize(path.join(p, url));

module.exports = {
  dir,
  file,
};
