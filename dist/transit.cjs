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
}
exports.Transit = Transit;