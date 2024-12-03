import { Format } from './format.mjs';
export class JSendFormat extends Format{
    constructor(){
        super();
        this.loaded = new Promise((resolve)=>{ resolve(); });
    }
    
    formatReturn(type, result){
        /*
        if(result && (
            result instanceof Error || 
            result[0] instanceof Error
        )){
            
        }
        //*/
        switch(type){
            case 'create':
            case 'read':
            case 'update':
            case 'delete':
            case 'list':
            default: return this.encode(result);
        }
    }
    
    encode(decoded){
        return {
            status : 'success',
            data : decoded || null
        };
    }
    
    decode(encoded){
        return encoded.data;
    }
}