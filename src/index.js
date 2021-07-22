const path = require('path');
const fs = require('fs');
const util = require('util');

const mkdirp = require('mkdirp');

class HotManifestPlugin {
  constructor({ isHot, port, path, filename = 'hot-manifest.json' }) {
    this.isHot = isHot;
    this.port = port;
    this.path = path;
    this.filename = filename;

    this.deleteFile = util.promisify(fs.unlink);
    this.writeFile = util.promisify(fs.writeFile);
  }

  apply(compiler) {
    if (compiler.hooks && compiler.hooks.emit) {
      compiler.hooks.emit.tapAsync('HotManifestPlugin', this.run.bind(this));
    } else {
      compiler.plugin('emit', this.run.bind(this));
    }
  }

  run(compilation, callback) {
    const manifestPath = path.resolve(this.path, this.filename);
    if (this.isHot) {
      const manifest = JSON.stringify({ port: this.port });

      mkdirp(this.path)
        .then(() => this.writeFile(manifestPath, manifest))
        .then(() => {
          // eslint-disable-next-line no-param-reassign
          compilation.assets[this.filename] = {
            source: () => manifest,
            size: () => manifest.length,
          };
        })
        .then(callback);
    } else {
      this.deleteFile(manifestPath).then(callback);
    }
  }
}

module.exports = HotManifestPlugin;
