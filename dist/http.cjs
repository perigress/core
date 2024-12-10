"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpTransit = void 0;
var _transit = require("./transit.cjs");
var _express = _interopRequireDefault(require("express"));
var mod = _interopRequireWildcard(require("module"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// SERVER ONLY MODULE (unless we get a browser based express)

let _require = null;
const ensureRequire = () => !_require && (_require = mod.createRequire(_require('url').pathToFileURL(__filename).toString()));
let cors = null;
const httpVerbs = ['checkout', 'copy', 'delete', 'get', 'head', 'lock', 'merge', 'mkactivity', 'mkcol', 'move', 'm-search', 'notify', 'options', 'patch', 'post', 'purge', 'put', 'report', 'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'];
class HttpTransit extends _transit.Transit {
  constructor(options = {}) {
    super();
    if (!cors) {
      ensureRequire();
      cors = _require('cors');
    }
    if (options.operateByVerb) this.operateByVerb = true;else this.operateByEndpoint = true;
    if (options.format) this.setFormat(options.format);
    this.app = new _express.default();
    this.app.use(cors());
    this.app.use(_express.default.json());
    this.prefix = 'data/';
  }
  async open(options) {
    const port = options.port || 8000;
    //const serverOptions = {};
    const promise = new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          resolve(this.server);
        });
      } catch (ex) {
        reject(ex);
      }
    });
    return await promise;
  }
  error() {}
  close() {
    return this.server.close();
  }
  get(path, handler) {
    if (this.auth) {
      this.app.get(`${path}`, this.auth.httpAuthenticate(), handler);
    } else {
      this.app.get(`${path}`, handler);
    }
  }
  post(path, handler) {
    if (this.auth) {
      this.app.post(`${path}`, this.auth.httpAuthenticate(), handler);
    } else {
      this.app.post(`${path}`, handler);
    }
  }
  async registerEndpoints(api) {
    const schemas = api.schemas;
    let run = false;
    const createFn = async (meta, body, respond) => {
      const incomingObjectTypes = Object.keys(body);
      //TODO: support plurals
      const actions = incomingObjectTypes.map(key => {
        return {
          type: key,
          key,
          data: body[key],
          schema: schemas.filter(item => {
            return item.name === key;
          })[0],
          plural: false
        };
      });
      //TODO: verify schema
      //maybe convert to filter (should only be one?)
      const results = {};
      for (let lcv = 0; lcv < actions.length; lcv++) {
        const result = await api.create(actions[lcv].type, actions[lcv].data);
        results[actions[lcv].key] = result;
      }
      respond(results);
    };
    const readFn = async (meta, body, respond) => {
      const primaryField = api.primaryKey().field;
      if (meta.params[primaryField]) {
        const criteria = {};
        criteria[primaryField] = {
          $eq: meta.params[primaryField]
        };
        const results = {};
        const result = await api.read(meta.name, criteria);
        results[meta.name] = result[0]; // if primaryKey return 1
        respond(results);
      }
    };
    //const feedFn = (meta, body, respond)=>{ };
    const updateFn = async (meta, body, respond) => {
      const result = await api.update(meta.name, body[meta.name]);
      const results = {};
      results[meta.name] = result;
      respond(results);
    };
    const deleteFn = async (meta, body, respond) => {
      const result = await api.delete(meta.name, body[meta.name]);
      const results = {};
      results[meta.name] = result;
      respond(results);
    };
    const searchFn = (meta, body, respond) => {};
    const saveFn = (meta, body, respond) => {};
    for (let lcv = 0; lcv < schemas.length; lcv++) {
      if (this.operateByVerb) {
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}`, {
          post: createFn,
          get: readFn,
          put: updateFn,
          delete: deleteFn,
          search: searchFn,
          merge: saveFn
        });
        run = true;
      }
      if (this.operateByEndpoint || !run) {
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/create`, {
          post: createFn
        });
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/update`, {
          post: updateFn
        });
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/delete`, {
          post: deleteFn
        });
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/search`, {
          post: searchFn
        });
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/save`, {
          post: saveFn
        });
        this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/:id`, {
          get: readFn,
          post: readFn
        });
      }
    }
  }
  handleRequest(name, path, handler) {
    //meta, body, respond
    //todo: test if name is reserved (type/path/etc)
    if (typeof handler === 'object') {
      const verbs = Object.keys(handler);
      for (let lcv = 0; lcv < verbs.length; lcv++) {
        if (httpVerbs.indexOf(verbs[lcv]) === -1) {
          throw new Error(`Unrecognized HTTP verb:${verbs[lcv]}`);
        }
        const handleFn = async (req, res) => {
          const meta = {};
          meta.name = name;
          meta.path = path;
          meta.params = req.params;
          const body = req.body;
          if (this.debugAuth) {
            try {
              this.auth.passport.authenticate('jwt', (error, user, info) => {
                req.user = user;
                console.log(error);
                console.log(user);
                console.log(info);
              })(req, res);
            } catch (ex) {
              console.log('ERROR', ex);
            }
          }
          const requestBody = this.format.decode(body);
          await handler[verbs[lcv]](meta, requestBody, (responseData, responseMeta = {}) => {
            const result = this.format.encode(responseData);
            res.send(result);
          });
        };
        if (this.auth && !this.auth.debugAuth) {
          this.app[verbs[lcv]](`/${path}`, this.auth.httpAuthenticate(), handleFn);
        } else {
          this.app[verbs[lcv]](`/${path}`, handleFn);
        }
      }
    } else {
      if (this.auth) {
        this.app.get(`/${path}`, this.auth.httpAuthenticate(), async (req, res) => {
          const meta = {};
          meta.name = name;
          meta.path = path;
          meta.params = req.params;
          const body = req.body;
          handler(meta, body, (responseData, responseMeta = {}) => {
            const result = this.format.encode(responseData);
            res.send(result);
          });
        });
      } else {
        this.app.get(`/${path}`, async (req, res) => {
          const meta = {};
          meta.name = name;
          meta.path = path;
          meta.params = req.params;
          const body = req.body;
          handler(meta, body, (responseData, responseMeta = {}) => {
            const result = this.format.encode(responseData);
            res.send(result);
          });
        });
      }
    }
  }
}
exports.HttpTransit = HttpTransit;