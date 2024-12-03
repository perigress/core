import { Fixture } from '@open-automaton/moka';
import { simpleServerConfig, simpleObject } from '../util/simple.mjs';
import express from 'express';
import cors from "cors";

export class TestFixture extends Fixture{
    async createFixture(){
        const api = simpleServerConfig();
        api.transit.app.use(cors());
        api.transit.app.get('/hello', function (req, res) {
            res.send('world')
        });
        // if you give this a string ending with '+' it increments the port each time
        this.options.port = Fixture.makePort(this.options.port);
        const result = await api.start({
            port: this.options.port
        });
        return result;
    }
}