#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const LineReader = require('promise-readline');

opts.parse([
    {
        short       : 'o',
        long        : 'old-router-dir',
        description : 'old router path',
        value       : true,
        required    : true
    }, 
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
        name: 'file'
    }
], true);

const schemaPath    = opts.get('schema-dir');
const oldRouterPath = path.resolve(opts.get('old-router-dir'));
const newRouterPath = path.resolve(opts.get('router-dir'));
const mod = opts.arg('module(object|relation)');
const modelName = opts.arg('model_name');
const idFile = opts.arg('file');
const lr = LineReader(idFile ? fs.createReadStream(idFile) : process.stdin);
assert(fs.lstatSync(oldRouterPath).isDirectory(), `oldRouterPath(${oldRouterPath}) is expected to be a directory`);
assert(fs.lstatSync(newRouterPath).isDirectory(), `routerPath(${newRouterPath}) is expected to be a directory`);
const ORMOld = require('..')(schemaPath, oldRouterPath);
const ORMNew = require('..')(schemaPath, newRouterPath);

(async () => {
    let summary = {total: 0, success: 0, failed: 0};
    for(let id = await lr.readLine(); id != null; id = await lr.readLine()) {
        summary.total += 1;
        await migrate(mod, modelName, id).then(() => {
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

async function migrate(mod, modelName, id) {
    if (mod === 'object') {
        let object = await ORMOld.Object(modelName).get(id);
        await ORMNew.Object(modelName).set(object);
    }
    else if (mod === 'relation') {
        let relations = await ORMNew.Relation(modelName).list(id, 'subject', 'asc');
        await Promise.all(relations.map(relation => ORMNew.Relation(modelName).put(relation)));
    }
    else {
        throw new Error(`unknown mod: ${mod}`);
    }
}