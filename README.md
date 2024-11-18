@perigress/core
===============
A medium for contract based development.

Data maintenance, contract testing and data generation without boilerplate using a series of either [joi validators](https://joi.dev/api/)(.spec.joi.js), [JSON Schema](https://json-schema.org/)(.spec.schema.js), or example [JSON](https://json.org/example.html)(.spec.json) files to represent the structure of the API URLs(which you are probably **already** writing).

The ultimate goal of this library is to generate fully functional and tested backends, mocks, seeds and migrations from nothing more than a set of schema.

uses standard json-schema but with the addition of the `private` and `protected` fields on the root object (corresponding to *no* client access and *only* expanded access) and `link` on the member fields to point linkages to the correct object.

Usage
-----

There are a variety of scenarios where this can be useful:

1) Building a UI against an API that doesn't exist

2) Build a deterministic, functional API from only a set of data definitions

3) Build on the client and server while the wire format is being adjusted

4) Converting schema migrations into DB migrations

Setup a new project with:

```bash
peri init --validator=<type> --transfer=<format>
```

Create a new data type `foo` with (built interactively):

```bash
peri new foo
#peri edit foo
```

Then use in your project like:
```js
import { Perigress, Source } from '@perigress/core';
import { Source } from '@perigress/postgres'; // generate, postgres, sqlite, hypercore
import { Format } from '@perigress/json-http'; // json-http, soap-http, socket, CBOR
import { Data as Joi } from '@perigress/joi'; //joi, yup, ts, thrift, protobuf


const apiService = new Perigress.API({
        directories: [],
        //files: [],
        data: [ new Joi() ],
        sources : [ 
            new Source({
                name: '',
                host: '',
                user: '',
                password: '',
                port: ''
            })
        ],
        outputs : [
            new Format({
                name : 'fooOut',
                port: 11111
            })
        ]
});

```

with the definitions you include



Testing
-------

Run the es module tests to test the root modules
```bash
npm run import-test
```
to run the same test inside the browser:

```bash
npm run browser-test
```
to run the same test headless in chrome:
```bash
npm run headless-browser-test
```

to run the same test inside docker:
```bash
npm run container-test
```

Run the commonjs tests against the `/dist` commonjs source (generated with the `build-commonjs` target).
```bash
npm run require-test
```

Development
-----------
All work is done in the .mjs files and will be transpiled on commit to commonjs and tested.

If the above tests pass, then attempt a commit which will generate .d.ts files alongside the `src` files and commonjs classes in `dist`

