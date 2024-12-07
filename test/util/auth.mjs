import { 
    Perigress, 
    JSendFormat, 
    MemorySource, 
    JsonSchemaData, 
    HttpTransit
} from '../../src/index.mjs';
import { HttpLocalAuth } from '../../src/http-local-auth.mjs';
export const authServerConfig = ()=>{
    let api;
    const auth = new HttpLocalAuth({
        id : ['user.handle', 'user.email'],
        password : ['user.password'],
        issuer: 'server.domain.tld',
        audience: 'domain.tld',
        secret: 'a-test-secret'
        //hash : ()=>{}
    });
    const transit = new HttpTransit();
    //auth.debugAuth = true;
    //transit.debugAuth = true;
    const config = {
        auth,
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
        format: new JSendFormat(),
        transit,
        source: new MemorySource()
    };
    api = new Perigress.API(config);
    return api;
};

export const authObject = (ob={})=>{
    return {
        handle: ob.handle || 'admin',
        email: ob.email || 'foo@bar.baz',
        fullName: ob.fullName || 'Ed Beggler',
        birthdate: ob.birthdate || Date.now().toString(),
        location: ob.location || 'Nowhere, AZ',
        confirmed: ob.confirmed|| false
    };
};