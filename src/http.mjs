import { Transit } from './transit.mjs';
export class HttpTransit extends Transit{
    constructor(){
        super();
        this.loaded = new Promise((resolve)=>{ resolve(); });
    }
}