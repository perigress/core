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
  formatReturn(type, result) {
    /*
    if(result && (
        result instanceof Error || 
        result[0] instanceof Error
    )){
        
    }
    //*/
    switch (type) {
      case 'create':
      case 'read':
      case 'update':
      case 'delete':
      case 'list':
      default:
        return this.encode(result);
    }
  }
  encode(decoded) {
    return {
      status: 'success',
      data: decoded || null
    };
  }
  decode(encoded) {
    return encoded.data;
  }
}
exports.JSendFormat = JSendFormat;