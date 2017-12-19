#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const {count: countShard, dumpObject, dumpRelation} = require('./shard_reader');

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
    }
], true);

const schemaPath    = opts.get('schema-dir');
const oldRouterPath = path.resolve(opts.get('old-router-dir'));
const newRouterPath = path.resolve(opts.get('router-dir'));
const relationName  = opts.get('r');
const objectName    = opts.get('o');
const mod = opts.arg('module(object|relation)');
const modelName = opts.arg('model_name');
assert(fs.lstatSync(oldRouterPath).isDirectory(), `oldRouterPath(${oldRouterPath}) is expected to be a directory`);
assert(fs.lstatSync(newRouterPath).isDirectory(), `newRouterPath(${newRouterPath}) is expected to be a directory`);

migrate()
.then(process.exit)
.catch(err => {
    console.error(err);
    process.exit(-1);
});


async function migrate() {
    const oldRouter = require([oldRouterPath, mod, ...modelName.split('.')].join('/'));
    log(`start migrating ${mod} ${modelName}, found ${oldRouter.shards.length} shards in old router...`)
    for(let i in oldRouter.shards) {
        log(`shard[${i}]: start migrating...`);
        let count = await countShard(oldRouter.shards[i]);
        log(`shard[${i}]: ${count} ${mod}s found`);
        batchSize = 1000;
        for(let start = 0; start < count - 1; start += batchSize) {
            let models = await dump(mod, oldRouter.shards[i], [start, batchSize]);
            for(let model of models) {
                log(`shard[${i}]: migrating ${mod} ${model.id ? model.id : model.subject+'-'+model.object}`)
                await save(mod, modelName, model);
            }
        }
    }
}

function dump(mod, shard, limit) {
    if (mod === 'object') return dumpObject(shard, limit);
    else if (mod === 'relation') return dumpRelation(shard, limit);
    else throw new Error(`unknown mod: ${mod}`);
}

function save(mod, modelName, model) {
    const ORMNew = require('../..')(schemaPath, newRouterPath);
    if (mod === 'object') return ORMNew.Object(modelName).set(model);
    else if (mod === 'relation') return ORMNew.Relation(modelName).put(model);
    else throw new Error(`unknown mod: ${mod}`);
}

function log(msg) {
    console.log(msg);
}
