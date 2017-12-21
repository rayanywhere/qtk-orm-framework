#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const LineReader = require('promise-readline');

opts.parse([
    {
        short       : 'o',
        long        : 'old-schema-dir',
        description : 'old schema path',
        value       : true,
        required    : true
    }, 
    {
        short       : 's',
        long        : 'schema-dir',
        description : 'schema path',
        value       : true,
        required    : true
    },
    {
        short       : 'r',
        long        : 'router-dir',
        description : 'router path',
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
        name: 'reshaper',
        description: 'a js script that exports an ASYNC FUNCTION to reshape model.',
        required: true
    },
    {
        name: 'id_file'
    }
], true);

const schemaPath    = opts.get('schema-dir');
const oldSchemaPath = path.resolve(opts.get('old-schema-dir'));
const routerPath = path.resolve(opts.get('router-dir'));
const mod = opts.arg('module(object|relation)');
const modelName = opts.arg('model_name');
console.log(opts.arg('reshaper'));
const _reshape = require(opts.arg('reshaper'));
const idFile = opts.arg('id_file');
const lr = LineReader(idFile ? fs.createReadStream(idFile) : process.stdin);
assert(fs.lstatSync(routerPath).isDirectory(), `routerPath(${routerPath}) is expected to be a directory`);
assert(fs.lstatSync(schemaPath).isDirectory(), `schemaPath(${schemaPath}) is expected to be a directory`);
assert(fs.lstatSync(oldSchemaPath).isDirectory(), `oldSchemaPath(${oldSchemaPath}) is expected to be a directory`);

const ORMOld = require('..')(oldSchemaPath, routerPath);
const ORMNew = require('..')(schemaPath, routerPath);

(async () => {
    let summary = {total: 0, success: 0, failed: 0};
    for(let id = await lr.readLine(); id != null; id = await lr.readLine()) {
        summary.total += 1;
        await reshape(mod, modelName, id).then(() => {
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


async function reshape(mod, modelName, id) {
    if (mod === 'object') {
        let object = await ORMOld.Object(modelName).get(id);
        object = await _reshape(object);
        await ORMNew.Object(modelName).set(object);
    }
    else if (mod === 'relation') {
        let relations = await ORMOld.Relation(modelName).list(id, 'subject', 'asc');
        await Promise.all(relations.map(async relation => {
            relation = await _reshape(relation);
            await ORMNew.Relation(modelName).put(relation).catch(err => {console.log(err);});
        }));
    }
    else {
        throw new Error(`unknown mod: ${mod}`);
    }
}