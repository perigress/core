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
  handleRequest(name, handler) {
    //meta, data, respond
    throw new Error('.handleRequest must be implemented on source');
  }
}
exports.Transit = Transit;