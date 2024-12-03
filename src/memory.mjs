import { Source } from './source.mjs';
import { RandomExpression } from '@environment-safe/regular-expressions';
import sift from 'sift';

const uuidExpression = new RandomExpression(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
);

const replaceId = (ob, list)=>{
    list.forEach((item, index)=>{
        if(item.id === ob.id){
            list[index] = ob;
        }
    });
};

const removeId = (ob, list)=>{
    const length = list.length;
    list.concat([]).reverse().forEach((item, iindex)=>{
        const index = length - iindex - 1;
        if(item.id === ob.id){
            list.splice(index, 1);
        }
        
    });
};
export class MemorySource extends Source{
    index = {};
    
    constructor(options={}){
        super();
        this.directories = options.directories;
        this.loaded = this.loadObjects(options.directories);
        this.identifier = 'id';
    }
    
    async loadObjects(){ }
    
    types(){
        return Object.keys(this.index);
    }
    
    // ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
    create(type, typeDefinition, object){
        const copy = JSON.parse(JSON.stringify(object));
        if(!copy[this.identifier]){
            copy[this.identifier] = uuidExpression.generate();
        }
        if(!this.index[type]) this.index[type] = [];
        this.index[type].push(copy);
        return copy;
    }
    
    async read(type, typeDefinition, criteria){
        const filter = sift(criteria);
        const results = (this.index[type] || []).filter(filter);
        return JSON.parse(JSON.stringify(results));
    }
    
    async update(type, typeDefinition, object){
        replaceId(object, this.index[type]);
        return JSON.parse(JSON.stringify(object));
    }
    
    async delete(type, typeDefinition, object){
        removeId(object, this.index[type]);
        return JSON.parse(JSON.stringify(object));
    }
    
    //return a complex batch according to criteria
    async search(type, typeDefinition, criteria){
        const filter = sift(criteria);
        const results = (this.index[type] || []).filter(filter);
        return results;
    }
    
    join(){
        
    }
}