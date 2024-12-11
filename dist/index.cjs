"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "HttpTransit", {
  enumerable: true,
  get: function () {
    return _http.HttpTransit;
  }
});
Object.defineProperty(exports, "JSendFormat", {
  enumerable: true,
  get: function () {
    return _jsend.JSendFormat;
  }
});
Object.defineProperty(exports, "JsonSchemaData", {
  enumerable: true,
  get: function () {
    return _jsonSchema.JsonSchemaData;
  }
});
Object.defineProperty(exports, "MemorySource", {
  enumerable: true,
  get: function () {
    return _memory.MemorySource;
  }
});
exports.Perigress = void 0;
var _format = require("./format.cjs");
var _source = require("./source.cjs");
var _data = require("./data.cjs");
var _transit = require("./transit.cjs");
var _jsend = require("./jsend.cjs");
var _memory = require("./memory.cjs");
var _http = require("./http.cjs");
var _jsonSchema = require("./json-schema.cjs");
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

//core/loopback impls

//TODO: 'document mode' where it auto-joins all levels
class API {
  constructor(options) {
    this.options = options;
    this.locations = options.locations;
    this.data = options.data || [];
    this.format = options.format;
    this.audit = options.audit;
    this.transit = options.transit;
    if (this.transit) this.transit.api = this;
    this.source = options.source;
    if (this.transit) {
      if (this.format) {
        this.transit.setFormat(this.format);
      }
      if (options.auth) {
        this.auth = options.auth;
        this.auth.attachAPI(this);
      }
      this.transit.setAuth(this.auth);
    }
    let definitions = [];
    const data = this.data.map(DataClass => {
      const datum = new DataClass({
        directories: options.locations,
        files: options.files || options.schema
      });
      definitions.push(datum);
      return datum.loaded;
    });
    this.dataObjects = data;
    const getFile = async filename => {
      await definitions[0].loaded;
      return definitions[0].loadFile(filename);
    };

    //eslint-disable-next-line no-async-promise-executor
    this.loaded = new Promise(async (resolve, reject) => {
      try {
        let loadables = [];
        if (this.audit) {
          this.auditData = {};
          if (this.audit.definition) {
            //TODO: dynamic load
            const file = await getFile(this.audit.definition);
            await file.loaded;
          }
          if (this.audit.data) {
            this.auditData = this.audit.data;
          }
          this.auditValues = (ob, req) => {
            this.audit.set(ob, {
              currentUser: () => {
                if (this.auth) {
                  return req.user;
                } else return null;
              }
            });
          };
        }
        if (this.format) loadables.push(this.format.loaded);
        if (this.transit) loadables.push(this.transit.loaded);
        if (this.source) loadables.push(this.source.loaded);
        if (this.transitLoaded) loadables.push(this.transitLoaded);
        loadables = [...loadables, ...data];
        await Promise.all(loadables);
        let schemas = [];
        for (let lcv = 0; lcv < definitions.length; lcv++) {
          const schema = definitions[lcv].files.map(file => {
            return definitions[lcv].toJsonSchema(file);
          });
          schemas = schemas.concat(schema);
        }
        let auditKeys = null;
        try {
          for (let lcv = 0; lcv < schemas.length; lcv++) {
            //*
            if (this.auditData && this.auditData.properties) {
              if (!auditKeys) auditKeys = Object.keys(this.auditData.properties);
              for (let keyIndex = 0; keyIndex < auditKeys.length; keyIndex++) {
                //*
                if (schemas[lcv].properties[auditKeys[keyIndex]]) {
                  throw new Error(`Audit column collision (${auditKeys[keyIndex]})`);
                }
                schemas[lcv].properties[auditKeys[keyIndex]] = this.auditData.properties[auditKeys[keyIndex]];
                //*/
              }
            }
            //*/
          }
        } catch (ex) {
          console.log(ex);
        }
        this.schemas = schemas;
        if (this.transit) {
          this.transit.app.use(function (req, res, next) {
            next();
          });
          await this.transit.registerEndpoints(this);
          if (this.auth) {
            this.transit.setAuth(this.auth);
            this.auth.registerEndpoints(this);
          }
        }
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }
  endpoints() {
    return this.transit.app._router.stack.map(item => {
      return item.route && item.route.path || null;
    }).filter(item => {
      return item !== null;
    });
  }
  primaryKey() {
    return this.options.id;
  }
  async start(opts) {
    return await this.transit.open(opts);
  }
  async stop(opts) {
    return await this.transit.close(opts);
  }
  getType(name) {
    return this.schemas.reduce((agg, schema) => {
      if (schema.name === name) return schema;
      return agg;
    }, null);
  }
  getTypes() {
    return this.schemas.map(schema => {
      return schema.name;
    });
  }
  async create(type, object) {
    const schema = this.getType(type);
    const createdObject = await this.source.create(type, schema, object);
    return createdObject;
  }
  async read(type, criteria) {
    const schema = this.getType(type);
    const results = await this.source.read(type, schema, criteria);
    return results;
  }
  async update(type, object) {
    const schema = this.getType(type);
    const results = await this.source.update(type, schema, object);
    return results;
  }
  async delete(type, object) {
    const schema = this.getType(type);
    const results = await this.source.delete(type, schema, object);
    return results;
  }

  //return a complex batch according to criteria
  async search(type, criteria) {
    const schema = this.getType(type);
    const results = await this.source.search(type, schema, criteria);
    return results;
  }
  serve() {}
}
const Perigress = exports.Perigress = {
  API,
  Format: _format.Format,
  Source: _source.Source,
  Data: _data.Data,
  Transit: _transit.Transit
};