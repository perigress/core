// SERVER ONLY MODULE (unless we get a browser based express)
import { Transit } from './transit.mjs';
import express from 'express';

const httpVerbs = [
    'checkout', 'copy', 'delete', 'get', 'head', 'lock', 'merge', 'mkactivity', 'mkcol', 
    'move', 'm-search', 'notify', 'options', 'patch', 'post', 'purge', 'put', 'report', 
    'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'
];
export class HttpTransit extends Transit{
    constructor(options={}){
        super();
        if(options.operateByVerb) this.operateByVerb = true;
        else this.operateByEndpoint = true;
        if(options.format) this.setFormat(options.format);
        this.app = new express();
        this.app.use(express.json());
        this.prefix = 'data/';
    }
    
    async open(options){
        const port = options.port || 8000;
        //const serverOptions = {};
        const promise = new Promise((resolve, reject)=>{
            try{
                this.server = this.app.listen(port, ()=>{
                    resolve(this.server);
                });
            }catch(ex){ reject(ex); }
        });
        return await promise;
    }
    
    error(){
        
    }
    
    close(){
        return this.server.close();
    }
    
    get(path, handler){
        if(this.auth){
            this.app.get(
                `${path}`, 
                this.auth.httpAuthenticate(),
                handler
            );
        }else{
            this.app.get(
                `${path}`, 
                handler
            );
        }
    }
    
    post(path, handler){
        if(this.auth){
            this.app.post(
                `${path}`, 
                this.auth.httpAuthenticate(),
                handler
            );
        }else{
            this.app.post(
                `${path}`, 
                handler
            );
        }
    }
    
    async registerEndpoints(api){
        const schemas = api.schemas;
        let run = false;
        const createFn = async (meta, body, respond)=>{
            const incomingObjectTypes = Object.keys(body);
            //TODO: support plurals
            const actions = incomingObjectTypes.map((key)=>{
                return {
                    type: key,
                    key,
                    data: body[key],
                    schema: schemas.filter((item)=>{
                        return item.name === key;
                    })[0],
                    plural: false
                };
            });
            //TODO: verify schema
            //maybe convert to filter (should only be one?)
            const results = {};
            for(let lcv =0; lcv < actions.length; lcv++){
                const result = await api.create(actions[lcv].type, actions[lcv].data);
                results[actions[lcv].key] = result;
            }
            respond(results);
        };
        const readFn = async (meta, body, respond)=>{
            const primaryField = api.primaryKey().field;
            if(meta.params[primaryField]){
                const criteria = {};
                criteria[primaryField] = {$eq: meta.params[primaryField]};
                const results = {};
                const result = await api.read(meta.name, criteria);
                results[meta.name] = result[0]; // if primaryKey return 1
                respond(results);
            }
        };
        //const feedFn = (meta, body, respond)=>{ };
        const updateFn = async (meta, body, respond)=>{
            const result = await api.update(meta.name, body[meta.name]);
            const results = {};
            results[meta.name] = result;
            respond(results);
        };
        const deleteFn = async (meta, body, respond)=>{
            const result = await api.delete(meta.name, body[meta.name]);
            const results = {};
            results[meta.name] = result;
            respond(results);
        };
        const searchFn = (meta, body, respond)=>{
            
        };
        const saveFn = (meta, body, respond)=>{
            
        };
        for(let lcv=0; lcv < schemas.length; lcv++){
            if(this.operateByVerb){
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
            if(this.operateByEndpoint || !run){
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/create`, {post: createFn});
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/update`, {post: updateFn});
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/delete`, {post: deleteFn});
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/search`, {post: searchFn});
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/save`, {post: saveFn});
                this.handleRequest(schemas[lcv].name, `${this.prefix}${schemas[lcv].name}/:id`, {
                    get: readFn,
                    post: readFn
                });
            }
        }
    }
    
    handleRequest(name, path, handler){ //meta, body, respond
        //todo: test if name is reserved (type/path/etc)
        if(typeof handler === 'object'){
            const verbs = Object.keys(handler);
            for(let lcv=0; lcv< verbs.length; lcv++){
                if(httpVerbs.indexOf(verbs[lcv]) === -1){
                    throw new Error(`Unrecognized HTTP verb:${verbs[lcv]}`);
                }
                const handleFn = async (req, res) => {
                    const meta = {}; 
                    meta.name = name;
                    meta.path = path;
                    meta.params = req.params;
                    const body = req.body;
                    if(this.debugAuth){
                        try{
                            this.auth.passport.authenticate('jwt', (error, user, info)=>{
                                req.user = user;
                                console.log(error);
                                console.log(user);
                                console.log(info);
                            })(req, res);
                        }catch(ex){
                            console.log('ERROR', ex);
                        }
                    }
                    const requestBody = this.format.decode(body);
                    await handler[verbs[lcv]](
                        meta, 
                        requestBody, 
                        (responseData, responseMeta={})=>{
                            const result = this.format.encode(responseData);
                            res.send(result);
                        }
                    );
                };
                if(this.auth && (!this.auth.debugAuth)){
                    this.app[verbs[lcv]](`/${path}`, this.auth.httpAuthenticate(), handleFn);
                }else{
                    this.app[verbs[lcv]](`/${path}`, handleFn);
                }
            }
        }else{
            if(this.auth){
                this.app.get(
                    `/${path}`, 
                    this.auth.httpAuthenticate(),
                    async (req, res) => {
                        const meta = {}; 
                        meta.name = name;
                        meta.path = path;
                        meta.params = req.params;
                        const body = req.body;
                        handler(meta, body, (responseData, responseMeta={})=>{
                            const result = this.format.encode(responseData);
                            res.send(result);
                        });
                    }
                );
            }else{
                this.app.get(
                    `/${path}`, 
                    async (req, res) => {
                        const meta = {}; 
                        meta.name = name;
                        meta.path = path;
                        meta.params = req.params;
                        const body = req.body;
                        handler(meta, body, (responseData, responseMeta={})=>{
                            const result = this.format.encode(responseData);
                            res.send(result);
                        });
                    }
                );
            }
        }
    }
}