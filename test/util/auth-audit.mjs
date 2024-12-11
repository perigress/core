import { 
    Perigress, 
    JSendFormat, 
    MemorySource, 
    JsonSchemaData, 
    HttpTransit
} from '../../src/index.mjs';
import { HttpLocalAuth } from '../../src/http-local-auth.mjs';
import audit from '../data/audit.schema.json' assert { type: 'json' };


export const authAuditServerConfig = ()=>{
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
            data: audit,
            set: (object, context)=>{
                const user = context.currentUser();
                const now = Date.now();
                if(!object.createdBy_id) object.createdBy_id = user.id;
                if(!object.createdAt) object.createdAt = now;
                object.modifiedBy_id = user.id;
                object.modifiedAt = now;
            }
        },
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