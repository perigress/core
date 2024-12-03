/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it, fixture } from '@open-automaton/moka';
import { simpleLocalhostConfig, simpleObject } from './util/simple.mjs';
//
import { 
    Perigress, 
    //JSendFormat, 
    //MemorySource, 
    //JsonSchemaData, 
    //HttpTransit
} from '../src/index.mjs';
//*/
const should = chai.should();

const postRequest = (request)=>{
    return {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: (
            typeof request !== 'string'?
                JSON.stringify(request):
                request
        )
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
    
    describe('performs a simple test suite in memory across a network', ()=>{
        fixture('simple-server', { port: '8086+' }, (context, config)=>{
            it('can retrieve a static endpoint', async ()=>{
                try{
                    const result = await (await fetch(
                        `http://localhost:${config.port}/hello`
                    )).text();
                    should.exist(result);
                    result.should.equal('world');
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('saves a new object then retreives it', async ()=>{
                try{
                    const fullName = 'Edward Beggler';
                    const birthdate = Date.now();
                    const email = 'ed@beggler.net';
                    const  handle = 'robblerauser';
                    const result = await (await fetch(
                        `http://localhost:${config.port}/data/user/create`, postRequest({
                            data: {
                                user: {
                                    fullName,
                                    birthdate,
                                    email,
                                    handle
                                }
                            }
                        })
                    )).json();
                    should.exist(result);
                    should.exist(result.status);
                    result.status.should.equal('success');
                    should.exist(result.data);
                    should.exist(result.data.user);
                    should.exist(result.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} })
                    )).json();
                    should.exist(subsequentResult);
                    should.exist(subsequentResult.status);
                    subsequentResult.status.should.equal('success');
                    should.exist(subsequentResult.data);
                    should.exist(subsequentResult.data.user);
                    subsequentResult.data.user.id.should.equal(result.data.user.id);
                    subsequentResult.data.user.fullName.should.equal(fullName);
                    //todo: investigate the stringification here
                    subsequentResult.data.user.birthdate.toString().should.equal(birthdate.toString());
                    subsequentResult.data.user.email.should.equal(email);
                    subsequentResult.data.user.handle.should.equal(handle);
                    
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('saves a new object then edits, then retreives it', async ()=>{
                try{
                    const fullName = 'Adam Morningstar';
                    const birthdate = Date.now();
                    const email = 'monster@frankenstein.org';
                    const handle = 'frank';
                    const newName = 'Frankenstein\'s Monster';
                    const result = await (await fetch(
                        `http://localhost:${config.port}/data/user/create`, postRequest({
                            data: {
                                user: {
                                    fullName,
                                    birthdate,
                                    email,
                                    handle
                                }
                            }
                        })
                    )).json();
                    should.exist(result);
                    should.exist(result.status);
                    result.status.should.equal('success');
                    should.exist(result.data);
                    should.exist(result.data.user);
                    should.exist(result.data.user.id);
                    result.data.user.fullName = newName;
                    const editResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/update`, postRequest({
                            data: {
                                user: result.data.user
                            }
                        })
                    )).json();
                    should.exist(editResult);
                    should.exist(editResult.status);
                    editResult.status.should.equal('success');
                    should.exist(editResult.data);
                    should.exist(editResult.data.user);
                    should.exist(editResult.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} })
                    )).json();
                    should.exist(subsequentResult);
                    should.exist(subsequentResult.status);
                    subsequentResult.status.should.equal('success');
                    should.exist(subsequentResult.data);
                    should.exist(subsequentResult.data.user);
                    subsequentResult.data.user.id.should.equal(result.data.user.id);
                    subsequentResult.data.user.fullName.should.equal(newName);
                    subsequentResult.data.user.birthdate.should.equal(birthdate);
                    subsequentResult.data.user.email.should.equal(email);
                    subsequentResult.data.user.handle.should.equal(handle);
                    
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('saves a new object then deletes, then fail to retreive', async ()=>{
                try{
                    const fullName = 'Marvin Mxyztplk';
                    const birthdate = Date.now();
                    const email = 'mr@mxyztplk.org';
                    const handle = 'mrMxyztplk';
                    const result = await (await fetch(
                        `http://localhost:${config.port}/data/user/create`, postRequest({
                            data: {
                                user: {
                                    fullName,
                                    birthdate,
                                    email,
                                    handle
                                }
                            }
                        })
                    )).json();
                    should.exist(result);
                    should.exist(result.status);
                    result.status.should.equal('success');
                    should.exist(result.data);
                    should.exist(result.data.user);
                    should.exist(result.data.user.id);
                    const deleteResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/delete`, postRequest({
                            data: {
                                user: result.data.user
                            }
                        })
                    )).json();
                    should.exist(deleteResult);
                    should.exist(deleteResult.status);
                    deleteResult.status.should.equal('success');
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} })
                    )).json();
                    should.exist(subsequentResult);
                    should.exist(subsequentResult.status);
                    subsequentResult.status.should.equal('success');
                    should.exist(subsequentResult.data);
                    Object.keys(subsequentResult.data).length.should.equal(0);
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
        });
    });
    
    describe.skip('performs a simple test suite in memory across a network with auth', ()=>{
        
    });
});
