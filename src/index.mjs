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
        this.locations = options.locations;
        this.data = options.data || [];
        this.format = options.format;
        this.transit = options.transit;
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
                await Promise.all([
                    this.format.loaded,
                    this.transit.loaded,
                    this.source.loaded,
                    ...data
                ]);
                let schemas = [];
                for(let lcv=0; lcv< definitions.length; lcv++){
                    const schema = definitions[lcv].files.map((file)=>{
                        return definitions[lcv].toJsonSchema(file);
                    });
                    schemas = schemas.concat(schema);
                }
                this.schemas = schemas;
                resolve();
            }catch(ex){
                reject(ex);
            }
        }));
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