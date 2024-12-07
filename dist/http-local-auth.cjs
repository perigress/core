"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpLocalAuth = void 0;
var mod = _interopRequireWildcard(require("module"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
let _require = null;
const ensureRequire = () => !_require && (_require = mod.createRequire(_require('url').pathToFileURL(__filename).toString()));

//import * as LocalStrategy from 'passport-local';

let LocalStrategy = null;
let JwtStrategy = null;
let ExtractJwt = null;
let passport = null;
let jwt = null;
const opts = {};
class HttpLocalAuth {
  constructor(options = {}) {
    this.options = options;
  }
  attachAPI(api) {
    this.api = api;
    if (!(LocalStrategy && passport)) {
      ensureRequire();
      LocalStrategy = _require('passport-local');
      passport = _require('passport');
      JwtStrategy = _require('passport-jwt').Strategy;
      ExtractJwt = _require('passport-jwt').ExtractJwt;
      jwt = _require('jsonwebtoken');
      opts.jwtFromRequest = ExtractJwt.fromHeader('authorization');
      opts.secretOrKey = this.options.secret || 'secret';
      opts.issuer = this.options.issuer || 'perigress.api';
      opts.audience = this.options.audience || 'perigress.api';
      this.passport = passport;
    }
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
      const user = jwt_payload.user;
      (async () => {
        const found = (await api.read('user', {
          handle: {
            $eq: user.handle
          },
          email: {
            $eq: user.email
          }
        })).pop();
        return done(null, found || false);
      })();
    }));
    passport.use(new LocalStrategy(function (username, password, done) {
      (async () => {
        const found = (await api.read('user', {
          //id: {$eq: user.id}
        })).pop();
        return done(null, found || false);
      })();
    }));
  }
  registerEndpoints(api) {
    api.transit.app.post('/login', async (req, res, next) => {
      const post = req.body;
      if (post.data.handle && post.data.password) {
        const criteria = {
          handle: {
            $eq: post.data.handle
          },
          password: {
            $eq: post.data.password
          }
        };
        const userList = await api.read('user', criteria);
        if (userList.length === 1 && userList[0].handle === post.data.handle) {
          const secretKey = this.options.secret; // Replace with your own secret key
          const options = {
            expiresIn: '1h',
            // Token expiration time
            issuer: this.options.issuer,
            audience: this.options.audience
          };
          const token = jwt.sign({
            user: userList[0]
          }, secretKey, options);
          res.send({
            status: 'success',
            message: 'logged in',
            userId: userList[0].id,
            token
          });
        } else {
          res.send({
            status: 'success',
            code: 401,
            message: 'failed to login'
          });
        }
      } else {
        res.send({
          status: 'success',
          code: 401,
          message: 'credentials are required to authenticate'
        });
      }
    });
    api.transit.app.use(function (req, res, next) {
      res.status(404);
      res.send(JSON.stringify({
        status: 'failure',
        code: 404,
        message: `This URL(${req.url}) does not exist, or is not accessible to ${req.user ? req.user.handle : 'the public'}.`
      }));
    });
  }

  //produces an express compatible middleware
  httpAuthenticate(options = {}) {
    if (this.debugAuth) {
      return (req, res, next) => {
        console.log('skip');
        next();
      };
    } else {
      return passport.authenticate('jwt', {
        session: false
      });
    } //*/
  }
}
exports.HttpLocalAuth = HttpLocalAuth;