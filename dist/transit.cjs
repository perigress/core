"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transit = void 0;
class Transit {
  constructor() {
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
  setAuth(auth) {
    this.auth = auth;
  }
  setFormat(format) {
    this.format = format;
  }
  handleRequest(name, handler) {
    //meta, data, respond
    throw new Error('.handleRequest must be implemented on source');
  }
}
exports.Transit = Transit;