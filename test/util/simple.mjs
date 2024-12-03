import { 
    Perigress, 
    JSendFormat, 
    MemorySource, 
    JsonSchemaData, 
    HttpTransit
} from '../../src/index.mjs';
export const simpleLocalhostConfig =()=>{
    let api;
    const config = {
        id:{ //make default (uses uuids)
            field: 'id',
            postfix: '_id',
            type: 'string'
        },
        audit: {
            definition: './data/audit.schema.json',
            set: (object)=>{
                //if(!object.createdBy_id) object.createdBy_id = api.currentUser();
                //object.modifiedBy_id = api.currentUser();
                //if(!object.modifiedBy_id) object.modifiedBy_id = api.currentUser();
                //if(!)
            }
        },
        //locations : [ './data/schema' ],
        schema: [
            './data/schema/apikey.schema.json',
            './data/schema/message.schema.json',
            './data/schema/user.schema.json'
        ],
        data: [ JsonSchemaData ],
        source: new MemorySource()
    };
    api = new Perigress.API(config);
    return api;
};

export const simpleServerConfig =()=>{
    let api;
    const config = {
        id:{ //make default (uses uuids)
            field: 'id',
            postfix: '_id',
            type: 'string'
        },
        audit: {
            definition: './data/audit.schema.json',
            set: (object)=>{
                //if(!object.createdBy_id) object.createdBy_id = api.currentUser();
                //object.modifiedBy_id = api.currentUser();
                //if(!object.modifiedBy_id) object.modifiedBy_id = api.currentUser();
            }
        },
        //TODO: Support join whitelist
        //locations : [ './data/schema' ],
        schema: [
            './data/schema/apikey.schema.json',
            './data/schema/message.schema.json',
            './data/schema/user.schema.json'
        ],
        data: [ JsonSchemaData ],
        format: new JSendFormat(),
        transit: new HttpTransit(),
        source: new MemorySource()
    };
    api = new Perigress.API(config);
    return api;
};

export const simpleObject = (ob={})=>{
    return {
        handle: ob.handle || 'admin',
        email: ob.email || 'foo@bar.baz',
        fullName: ob.fullName || 'Ed Beggler',
        birthdate: ob.birthdate || Date.now().toString(),
        location: ob.location || 'Nowhere, AZ',
        confirmed: ob.confirmed|| false
    };
};