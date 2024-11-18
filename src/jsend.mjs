import { Format } from './format.mjs';
export class JSendFormat extends Format{
    constructor(){
        super();
        this.loaded = new Promise((resolve)=>{ resolve(); });
    }
}