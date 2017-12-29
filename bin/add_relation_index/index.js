#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const Builder = require('./builder');
const PreviewExectuor = require('./executor/preview');
const DatabaseExecutor = require('./executor/database');

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema-dir',
            description : 'schema资源目录',
            value       : true,
            required    : true, 
        },
        { 
            short       : 'r',
            long        : 'router-dir',
            description : 'router资源目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 'f',
            long        : 'field',
            description : '需要建立索引的字段',
            value       : true,
            required    : true
        },
        {
            long        : 'preview',
            description : '只打印执行sql日志,不实际生成数据库',
        }
    ],
    [
        { name : 'module', required: true },
    ], true);

const schemaDir = opts.get('s');
const routerDir = opts.get('r');
const moduleName = opts.args()[0];
const field = opts.get('f');

const builder = new Builder(schemaDir, routerDir, moduleName, field);
const executor = opts.get('preview') ? new PreviewExectuor() : new DatabaseExecutor();

const actions = builder.exec();
executor.exec(actions).catch(err => {
    console.error(err.stack);
    process.exit(-1);
});