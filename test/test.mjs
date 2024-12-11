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

const postRequest = (request, headers={})=>{
    const postHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const keys = Object.keys(headers);
    for(let lcv=0; lcv < keys.length; lcv++){
        postHeaders[keys[lcv]] = headers[keys[lcv]];
    }
    return {
        method: 'post',
        headers: postHeaders,
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
    
    describe('performs a simple test suite in memory across a network with auth', ()=>{
        fixture('auth-server', { port: '8086+' }, (context, config)=>{
            it('fails on a protected static endpoint', async ()=>{
                try{
                    const result = await (await fetch(
                        `http://localhost:${config.port}/hello`
                    )).text();
                    should.exist(result);
                    const data = JSON.parse(result);
                    should.exist(data.status);
                    data.status.should.equal('failure');
                    should.exist(data.code);
                    data.code.should.equal(404);
                    should.exist(data.message);
                    data.message.should.equal('This URL(/hello) does not exist, or is not accessible to the public.');
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('logs in and can request a static endpoint', async ()=>{
                try{
                    const transfer = await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    );
                    const result = await transfer.text();
                    should.exist(result);
                    const data = JSON.parse(result);
                    const staticTransfer = await fetch(
                        `http://localhost:${config.port}/data/user/${data.userId}`, {
                            headers: { Authorization: data.token }
                        }
                    );
                    const staticResult = await (staticTransfer).json();
                    should.exist(staticResult.status);
                    staticResult.status.should.equal('success');
                    should.exist(staticResult.data);
                    should.exist(staticResult.data.user);
                    should.exist(staticResult.data.user.handle);
                    staticResult.data.user.handle.should.equal('alibaba');
                    should.exist(staticResult.data.user.email);
                    staticResult.data.user.email.should.equal('foo@bar.com');
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('saves an authed new object then retreives it', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(result);
                    should.exist(result.status);
                    result.status.should.equal('success');
                    should.exist(result.data);
                    should.exist(result.data.user);
                    should.exist(result.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
            
            it('saves an authed new object then edits, then retreives it', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(editResult);
                    should.exist(editResult.status);
                    editResult.status.should.equal('success');
                    should.exist(editResult.data);
                    should.exist(editResult.data.user);
                    should.exist(editResult.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
            
            it('saves an authed new object then deletes, then fail to retreive', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(deleteResult);
                    should.exist(deleteResult.status);
                    deleteResult.status.should.equal('success');
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
    
    describe('performs a simple test suite in memory across a network with auth and audit columns', ()=>{
        fixture('auth-audit-server', { port: '8086+' }, (context, config)=>{
            it('fails on a protected static endpoint with audit columns', async ()=>{
                try{
                    const result = await (await fetch(
                        `http://localhost:${config.port}/hello`
                    )).text();
                    should.exist(result);
                    const data = JSON.parse(result);
                    should.exist(data.status);
                    data.status.should.equal('failure');
                    should.exist(data.code);
                    data.code.should.equal(404);
                    should.exist(data.message);
                    data.message.should.equal('This URL(/hello) does not exist, or is not accessible to the public.');
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('logs in and can request a static endpoint with audit columns', async ()=>{
                try{
                    const transfer = await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    );
                    const result = await transfer.text();
                    should.exist(result);
                    const data = JSON.parse(result);
                    const staticTransfer = await fetch(
                        `http://localhost:${config.port}/data/user/${data.userId}`, {
                            headers: { Authorization: data.token }
                        }
                    );
                    const staticResult = await (staticTransfer).json();
                    should.exist(staticResult.status);
                    staticResult.status.should.equal('success');
                    should.exist(staticResult.data);
                    should.exist(staticResult.data.user);
                    should.exist(staticResult.data.user.handle);
                    staticResult.data.user.handle.should.equal('alibaba');
                    should.exist(staticResult.data.user.email);
                    staticResult.data.user.email.should.equal('foo@bar.com');
                }catch(ex){
                    console.log(ex);
                    should.not.exist(ex);
                }
            });
            
            it('saves an authed new object then retreives it with audit columns', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(result);
                    should.exist(result.status);
                    result.status.should.equal('success');
                    should.exist(result.data);
                    should.exist(result.data.user);
                    should.exist(result.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
            
            it('saves an authed new object then edits, then retreives it with audit columns', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(editResult);
                    should.exist(editResult.status);
                    editResult.status.should.equal('success');
                    should.exist(editResult.data);
                    should.exist(editResult.data.user);
                    should.exist(editResult.data.user.id);
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
            
            it('saves an authed new object then deletes, then fail to retreive with audit columns', async ()=>{
                try{
                    const auth = await (await fetch(
                        `http://localhost:${config.port}/login`, postRequest({
                            data: {
                                handle: 'alibaba',
                                password: 'opensesame'
                            }
                        })
                    )).json();
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
                        }, { Authorization: auth.token })
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
                        }, { Authorization: auth.token })
                    )).json();
                    should.exist(deleteResult);
                    should.exist(deleteResult.status);
                    deleteResult.status.should.equal('success');
                    const subsequentResult = await (await fetch(
                        `http://localhost:${config.port}/data/user/${result.data.user.id}`, 
                        postRequest({ data: {} }, { Authorization: auth.token })
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
});
