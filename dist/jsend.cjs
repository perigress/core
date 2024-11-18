"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSendFormat = void 0;
var _format = require("./format.cjs");
class JSendFormat extends _format.Format {
  constructor() {
    super();
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
}
exports.JSendFormat = JSendFormat;