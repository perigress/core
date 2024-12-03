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
export class Format{
    constructor(){
        this.loaded = new Promise((resolve)=>{ resolve(); });
    }
    
    toJsonSchema(definition){
        
    }
    
    formatReturn(type, result){
        
    }
}