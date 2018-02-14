const { resolve } = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = class HotManifestPlugin {
  constructor({
    isHot, port, path, filename = 'hot-manifest.json',
  }) {
    this.isHot = isHot;
    this.port = port;
    this.path = path;
    this.filename = filename;
    this.manifestPath = resolve(path, filename);
  }


  deleteHotManifest() {
    return new Promise((res) => {
      // do nothing if there's an error;
      fs.unlink(this.manifestPath, () => res());
    });
  }

  createBuildDirectory() {
    return new Promise((res, rej) => {
      mkdirp(this.path, (err) => (err ? rej(err) : res()));
    });
  }

  writeManifest(manifest) {
    return new Promise((res, rej) => {
      fs.writeFile(this.manifestPath, manifest, (err) => (err ? rej(err) : res()));
    });
  }

  apply(compiler) {
    const manifest = JSON.stringify({ port: this.port });


    compiler.plugin('emit', (compilation, cb) => {
      const addManifestAsset = () => {
      // eslint-disable-next-line no-param-reassign
        compilation.assets[this.filename] = {
          source: () => manifest,
          size: () => manifest.length,
        };
      };


      if (this.isHot) {
        this.createBuildDirectory()
          .then(() => this.writeManifest(manifest))
          .then(addManifestAsset)
          .then(cb);
      } else {
        this.deleteHotManifest().then(cb);
      }
    });
  }
};
