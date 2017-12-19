#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const tools = require(`${__dirname}/../src/tools`);

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema_dir',
            description : 'schema资源目录',
            value       : true,
            required    : true
        },
        { 
            short       : 'r',
            long        : 'router_dir',
            description : 'router资源目录',
            value       : true,
            required    : true
        }
    ]
    ,
    [
        { name : 'type' , required : true }
    ], true);

let schemaDir = opts.get('s');
let routerDir = opts.get('r');
let type = opts.args()[0];

const halt = (msg) => {
    console.error(msg);
    process.exit(-1);
};

if (type != 'object' && type != 'relation') {
    halt('type should be object or relation');
}


if (!fs.existsSync(routerDir)) {
    halt(`${routerDir} is not exist`);
}

if (!fs.existsSync(schemaDir)) {
    halt(`${schemaDir} is not exist`);
}

tools.list(schemaDir, routerDir, type).map(item => console.log(item));