import * as mod from 'module';
let require = null;
const ensureRequire = ()=> (!require) && (require = mod.createRequire(import.meta.url));

//import * as LocalStrategy from 'passport-local';

let LocalStrategy = null;
let JwtStrategy = null;
let ExtractJwt = null;
let passport = null;
let jwt = null;
const opts = {};

export class HttpLocalAuth{
    constructor(options={}){
        this.options = options;
    }
    
    attachAPI(api){
        this.api = api;
        if(!(LocalStrategy && passport)){
            ensureRequire();
            LocalStrategy = require('passport-local');
            passport = require('passport');
            JwtStrategy = require('passport-jwt').Strategy;
            ExtractJwt = require('passport-jwt').ExtractJwt;
            jwt = require('jsonwebtoken');
            opts.jwtFromRequest = ExtractJwt.fromHeader('authorization');
            opts.secretOrKey = this.options.secret || 'secret';
            opts.issuer = this.options.issuer || 'perigress.api';
            opts.audience = this.options.audience || 'perigress.api';
            this.passport = passport;
        }
        passport.use(new JwtStrategy(opts, function(jwt_payload, done){
            const user = jwt_payload.user;
            (async ()=>{
                const found = (await api.read('user', {
                    handle: {$eq: user.handle},
                    email: {$eq: user.email}
                })).pop();
                return done(null, found || false);
            })();
            
        }));
        passport.use(new LocalStrategy(
            function(username, password, done) {
                (async ()=>{
                    const found = (await api.read('user', {
                        //id: {$eq: user.id}
                    })).pop();
                    return done(null, found || false);
                })();
            }
        ));
    }
    
    registerEndpoints(api){
        api.transit.app.post('/login', async (req, res, next)=>{
            const post = req.body;
            if(post.data.handle && post.data.password){
                const criteria = {
                    handle: {$eq: post.data.handle},
                    password: {$eq: post.data.password}
                };
                const userList = await api.read('user', criteria);
                if(
                    userList.length === 1 &&
                    userList[0].handle === post.data.handle
                ){
                    const secretKey = this.options.secret; // Replace with your own secret key
                    const options = {
                        expiresIn: '1h', // Token expiration time
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
                }else{
                    res.send({
                        status: 'success',
                        code: 401,
                        message: 'failed to login'
                    });
                }
            }else{
                res.send({
                    status: 'success',
                    code: 401,
                    message: 'credentials are required to authenticate'
                });
            }
        });
        api.transit.app.use(function(req, res, next) {
            res.status(404);
            res.send(JSON.stringify({
                status: 'failure',
                code: 404,
                message: `This URL(${req.url}) does not exist, or is not accessible to ${
                    req.user?req.user.handle:'the public'
                }.`
            }));
        });
    }
    
    
    
    //produces an express compatible middleware
    httpAuthenticate(options = {}){
        if(this.debugAuth){
            return (req, res, next)=>{ console.log('skip'); next(); };
        }else{
            return passport.authenticate('jwt', {session: false});
        } //*/
    }
}