"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Format = void 0;
/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/

/**
 * A JSON object
 * @typedef { object } JSON
 */

// A format is the wire transfer for the API 
class Format {
  constructor() {
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
  toJsonSchema(definition) {}
  formatReturn(type, result) {}
}
exports.Format = Format;