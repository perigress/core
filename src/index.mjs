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

import { Format } from './format.mjs';
import { Source } from './source.mjs';
import { Data } from './data.mjs';
import { Transit } from './transit.mjs';

import { JSendFormat } from './jsend.mjs';
import { MemorySource } from './memory.mjs';
import { HttpTransit } from './http.mjs';
import { JsonSchemaData } from './json-schema.mjs';

//core/loopback impls

//TODO: 'document mode' where it auto-joins all levels
class API{
    constructor(options){
        this.options = options;
        this.locations = options.locations;
        this.data = options.data || [];
        this.format = options.format;
        this.transit = options.transit;
        if(this.transit){
            if(this.format){
                this.transit.setFormat(this.format);
            }
        }
        this.source = options.source;
        
        let definitions = [];
        const data = this.data.map((DataClass)=>{
            const datum = new DataClass({ 
                directories: options.locations,
                files: options.files || options.schema
            });
            definitions.push(datum);
            return datum.loaded;
        });
        
        //eslint-disable-next-line no-async-promise-executor
        this.loaded = (new Promise(async (resolve, reject)=>{
            try{
                let loadables = [];
                if(this.format) loadables.push(this.format.loaded);
                if(this.transit) loadables.push(this.transit.loaded);
                if(this.source) loadables.push(this.source.loaded);
                if(this.transitLoaded) loadables.push(this.transitLoaded);
                loadables = [...loadables, ...data];
                await Promise.all(loadables);
                let schemas = [];
                for(let lcv=0; lcv< definitions.length; lcv++){
                    const schema = definitions[lcv].files.map((file)=>{
                        return definitions[lcv].toJsonSchema(file);
                    });
                    schemas = schemas.concat(schema);
                }
                for(let lcv=0; lcv < schemas.length; lcv++){
                    schemas[lcv];
                }
                this.schemas = schemas;
                if(this.transit) await this.transit.registerEndpoints(this);
                resolve();
            }catch(ex){
                reject(ex);
            }
        }));
    }
    
    primaryKey(){
        return this.options.id;
    }
    
    async start(opts){
        return await this.transit.open(opts);
    }
    
    async stop(opts){
        return await this.transit.close(opts);
    }
    
    getType(name){
        return this.schemas.reduce((agg, schema)=>{
            if(schema.name === name) return schema;
            return agg;
        }, null);
    }
    
    getTypes(){
        return this.schemas.map((schema)=>{
            return schema.name;
        });
    }
    
    async create(type, object){
        const schema = this.getType(type);
        const createdObject = await this.source.create(type, schema, object);
        return createdObject;
    }
    
    async read(type, criteria){
        const schema = this.getType(type);
        const results = await this.source.read(type, schema, criteria);
        return results;
    }
    
    async update(type, object){
        const schema = this.getType(type);
        const results = await this.source.update(type, schema, object);
        return results;
    }
    
    async delete(type, object){
        const schema = this.getType(type);
        const results = await this.source.delete(type, schema, object);
        return results;
    }
    
    //return a complex batch according to criteria
    async search(type, criteria){
        const schema = this.getType(type);
        const results = await this.source.search(type, schema, criteria);
        return results;
    }
    
    serve(){
        
    }
}

export const Perigress = { API, Format, Source, Data, Transit };
export { JSendFormat, MemorySource, JsonSchemaData, HttpTransit };