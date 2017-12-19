#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const tools = require(`${__dirname}/../src/tools`);

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema_dir',
            description : 'schema资源目录',
            value       : true,
            required    : true, 
        },
        { 
            short       : 'r',
            long        : 'router_dir',
            description : 'router资源目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 'l',
            long        : 'log_file',
            description : '日志文件绝对路径',
            value       : true,
            required    : true
        },
        {
            short       : 'f',
            long        : 'field',
            description : 'relation中需要建立索引的字段',
            value       : true,
            required    : true
        },
        {
            long        : 'preview',
            description : '只打印执行sql日志,不实际生成数据库',
        }
    ]
    ,
    [
        { name : 'module', required: true },
    ], true);

const schemaDir = opts.get('s');
const routerDir = opts.get('r');
const type = 'relation';
const moduleName = opts.args()[0];
const field = opts.get('f');

const halt = (msg) => {
    console.error(msg);
    process.exit(-1);
};

log4js.configure({
    appenders: [
        {
            type: 'dateFile',
            filename: opts.get('l'),
            category: 'default'
        }
    ]
});
global.logger = log4js.getLogger('default');

const schemaFile = `${schemaDir}/${type}/${moduleName.replace(/\./g, '/')}.js`;
const routerFile = `${routerDir}/${type}/${moduleName.replace(/\./g, '/')}.js`;

if (!fs.existsSync(schemaFile)) {
    halt(`${schemaFile} is not exist`);
}

if (!fs.existsSync(`${routerFile}`)) {
    halt(`${routerFile} is not exist`);
}


tools.addIndex('mysql', schemaDir, routerDir, type, moduleName, field, opts.get('preview'));