"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Data = void 0;
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

// data is the expressible format for the object definitions 
// (json-data, SOAP, jsend)
class Data {
  constructor() {
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
  async loadFile(filename) {
    const file = new File(filename);
    await file.loaded;
    return file;
  }
}
exports.Data = Data;