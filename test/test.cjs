const should = require('chai').should();
const { Perigress } = require('../dist/index.cjs');

const simpleLocalhostConfig =()=>{
    let api;
    const config = {
        id:{ //make default (uses uuids)
            field: 'id',
            postfix: '_id',
            type: 'string'
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

const simpleObject = (ob={})=>{
    return {
        handle: ob.handle || 'admin',
        email: ob.email || 'foo@bar.baz',
        fullName: ob.fullName || 'Ed Beggler',
        birthdate: ob.birthdate || Date.now().toString(),
        location: ob.location || 'Nowhere, AZ',
        confirmed: ob.confirmed|| false
    };
};

describe('@perigress/core', ()=>{
    describe('performs a simple test suite in memory', ()=>{
        it('saves and loads a user', async ()=>{
            should.exist(Perigress);
            const api = simpleLocalhostConfig();
            await api.loaded;
            //await api.serve(8000);
            const user = await api.create('user', simpleObject());
            should.exist(user);
            should.exist(user.id);
            (typeof user.id).should.equal('string');
            const emptyReadUserList = await api.read('user', {
                id: {$eq: 'foo'}
            });
            emptyReadUserList.length.should.equal(0);
            const readUserList = await api.read('user', {
                id: {$eq: user.id}
            });
            const readUser = readUserList[0];
            user.should.deep.equal(readUser);
        });
        
        it('saves and edits a user', async ()=>{
            should.exist(Perigress);
            const newName = 'John Doe';
            const api = simpleLocalhostConfig();
            await api.loaded;
            //await api.serve(8000);
            const user = await api.create('user', simpleObject());
            should.exist(user);
            should.exist(user.id);
            const readUser = (await api.read('user', {
                id: {$eq: user.id}
            })).pop();
            user.should.deep.equal(readUser);
            readUser.fullName = newName;
            await api.update('user', readUser);
            const updatedReadUser = (await api.read('user', {
                id: {$eq: user.id}
            })).pop();
            updatedReadUser.fullName.should.deep.equal(newName);
        });
        
        it('saves and deletes a user', async ()=>{
            should.exist(Perigress);
            const api = simpleLocalhostConfig();
            await api.loaded;
            //await api.serve(8000);
            const user = await api.create('user', simpleObject());
            should.exist(user);
            should.exist(user.id);
            const readUser = (await api.read('user', {
                id: {$eq: user.id}
            })).pop();
            user.should.deep.equal(readUser);
            await api.delete('user', readUser);
            const rereadUser = (await api.read('user', {
                id: {$eq: user.id}
            })).pop();
            should.not.exist(rereadUser);
        });
    });
});
