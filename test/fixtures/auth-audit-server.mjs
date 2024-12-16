import { Fixture } from '@open-automaton/moka';
import { authAuditServerConfig, authObject } from '../util/auth-audit.mjs';
import { HttpLocalAuth } from '../../src/http-local-auth.mjs';
import express from 'express';
import cors from "cors";

export class TestFixture extends Fixture{
    async createFixture(){
        const api = authAuditServerConfig();
        await api.loaded;
        await api.create('user', { //stuff a user to login as
            handle: 'alibaba',
            password: 'opensesame',
            email: 'foo@bar.com'
        });
        api.transit.app.use(cors());
        api.transit.get('/hello', (req, res, next)=>{
            respond('world');
        });
        // if you give this a string ending with '+' it increments the port each time
        this.options.port = Fixture.makePort(this.options.port);
        const result = await api.start({
            port: this.options.port
        });
        return result;
    }
}