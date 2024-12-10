"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonSchemaData = void 0;
var _data = require("./data.cjs");
require("@environment-safe/json-schema");
var _file = require("@environment-safe/file");
class JsonSchemaData extends _data.Data {
  constructor(options = {
    directories: ['./data/']
  }) {
    super();
    this.loaded = this.preload(options);
  }

  //TODO: type detection for mixed types

  async loadFile(filename) {
    const file = new _file.File(filename);
    const thisPath = new _file.Path(filename);
    const nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
    const fileName = nativeMeta.name.split('.').shift();
    file.name = fileName;
    await file.loaded;
    return file;
  }
  async preload(options) {
    if (options.directories) {
      const dirs = options.directories;
      let theseFiles;
      let allFiles = [];
      for (let lcv = 0; lcv < dirs.length; lcv++) {
        theseFiles = await this.scanDirectory(dirs[lcv]);
        allFiles = allFiles.concat(theseFiles.map(file => {
          return _file.Path.join(dirs[lcv], file);
        }));
      }
      const fileBodies = [];
      let fileLoadFutures = [];
      let thisPath;
      let nativeMeta;
      let fileName;
      for (let lcv = 0; lcv < allFiles.length; lcv++) {
        fileBodies[lcv] = new _file.File(allFiles[lcv]);
        fileLoadFutures.push(fileBodies[lcv].load());
        thisPath = new _file.Path(allFiles[lcv]);
        nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
        fileName = nativeMeta.name.split('.').shift();
        fileBodies[lcv].name = fileName;
      }
      await Promise.all(fileLoadFutures);
      this.fileNames = allFiles;
      this.files = fileBodies;
      return;
    }
    if (options.files) {
      const allFiles = options.files;
      const fileBodies = [];
      let fileLoadFutures = [];
      let thisPath;
      let nativeMeta;
      let fileName;
      for (let lcv = 0; lcv < allFiles.length; lcv++) {
        fileBodies[lcv] = new _file.File(allFiles[lcv]);
        fileLoadFutures.push(fileBodies[lcv].load());
        thisPath = new _file.Path(allFiles[lcv]);
        nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
        fileName = nativeMeta.name.split('.').shift();
        fileBodies[lcv].name = fileName;
      }
      await Promise.all(fileLoadFutures);
      this.fileNames = allFiles;
      this.files = fileBodies;
    }
  }
  async scanDirectory(path, filter) {
    const list = await _file.File.list(path, {
      files: true,
      directories: false
    });
    return list;
  }
  toJsonSchema(file) {
    const str = file.body().cast('string');
    const data = JSON.parse(str);
    data.name = file.name;
    return data;
  }
}
exports.JsonSchemaData = JsonSchemaData;