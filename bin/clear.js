#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const LineReader = require('promise-readline');

opts.parse([
    {
        short       : 'r',
        long        : 'router-dir',
        description : 'router path',
        value       : true,
        required    : true
    },
    {
        short       : 's',
        long        : 'schema-dir',
        description : 'schema path',
        value       : true,
        required    : true
    }
], [
    { 
        name: 'module(object|relation)',
        required: true,
        callback: value => assert(value == 'object' || value == 'relation', 'expect module to be object or relation')
    },
    { 
        name: 'model_name',
        required: true
    },
    {
        name: 'id_file'
    }
], true);

const routerPath = path.resolve(opts.get('router-dir'));
const schemaPath = opts.get('schema-dir');
const mod = opts.arg('module(object|relation)');
const modelName = opts.arg('model_name');
const idFile = opts.arg('id_file');
const lr = LineReader(idFile ? fs.createReadStream(idFile) : process.stdin);
assert(fs.lstatSync(routerPath).isDirectory(), `routerPath(${routerPath}) is expected to be a directory`);
const ORM = require('..')(schemaPath, routerPath);

(async () => {
    let summary = {total: 0, success: 0, failed: 0};
    for(let id = await lr.readLine(); id != null; id = await lr.readLine()) {
        summary.total += 1;
        await clear(mod, modelName, id).then(() => {
            console.log(`[DONE] ${mod}-${modelName}-${id}`)
            summary.success += 1;
        })
        .catch(err => {
            console.error(`[FAILED] ${mod}-${modelName}-${id}`);
            summary.failed += 1;
        });
    }
    console.log(summary);
})()
.then(process.exit)
.catch(err => {
    console.log(err);
    process.exit(-1);
});;

async function clear(mod, modelName, id) {
    if (mod === 'object') {
        await ORM.Object(modelName).del(id);
    }
    else if (mod === 'relation') {
        await ORM.Relation(modelName).removeAll(id);
    }
    else {
        throw new Error(`unknown mod: ${mod}`);
    }
}