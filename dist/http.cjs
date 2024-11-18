"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpTransit = void 0;
var _transit = require("./transit.cjs");
class HttpTransit extends _transit.Transit {
  constructor() {
    super();
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
}
exports.HttpTransit = HttpTransit;