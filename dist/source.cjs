"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Source = void 0;
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

// source is the data source for the data (postgres/mongo/hypercore/SQLite/etc)
class Source {
  constructor() {
    this.loaded = new Promise(resolve => {
      resolve();
    });
  }
  create(type, typeDefinition, object) {
    throw new Error('.create must be implemented on source');
  }
  read(type, typeDefinition, criteria) {
    throw new Error('.read must be implemented on source');
  }
  update(type, typeDefinition, object) {
    throw new Error('.update must be implemented on source');
  }
  delete(type, typeDefinition, object) {
    throw new Error('.delete must be implemented on source');
  }

  //return a complex batch according to criteria
  search(type, typeDefinition, criteria) {}
}
exports.Source = Source;