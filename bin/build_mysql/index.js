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
            short       : 'd',
            long        : 'dir',
            description : '资源目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 'p',
            long        : 'preview',
            description : '只打印执行sql日志,不实际生成数据库',
            value       : true,
            required    : false
        },
        {
            short       : 'k',
            long        : 'key-spec',
            description : 'key的mysql属性，例如:VARCHAR(255)',
            value       : true,
            required    : true
        }
    ],
    [
        { name : 'module', required: true },
    ], true);

const routerDir = path.resolve(`${opts.get('dir')}/router`);
const keyspec   = opts.get('key-spec');
const builder = new Builder(keyspec, routerDir, opts.args()[0]);
const executor = opts.get('preview') ? new PreviewExectuor() : new DatabaseExecutor();

executor.exec(builder.exec()).catch(err => {
    console.error(err.stack);
    process.exit(-1);
});