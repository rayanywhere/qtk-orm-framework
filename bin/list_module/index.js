#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const walk = require('klaw-sync');

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema-dir',
            description : 'schema资源目录',
            value       : true,
            required    : true
        },
        { 
            short       : 'r',
            long        : 'router-dir',
            description : 'router资源目录',
            value       : true,
            required    : true
        }
    ],
    [
        { name : 'type' , required : true }
    ], true);

let schemaDir = opts.get('s');
let routerDir = opts.get('r');
let type = opts.args()[0];

try {
    list_module(schemaDir, routerDir, type).map(item => console.log(item));
} catch(err) {
    console.error(err.stack);
    process.exit(-1);
}


function list_module(schemaDir, routerDir, type) {
    let moduleList = [];
    walk(schemaDir, {
        nodir: true,
        filter: item => item.path.endsWith('.js')
    }).forEach((item) => {
        if (!fs.existsSync(`${item.path.replace(schemaDir, routerDir)}`)) {
            throw new Error(`router file of ${item.path} is lost`);
        }
        const module = item.path.replace(`${schemaDir}/`, '').replace(/\//g, '.').replace('.js', '');
        moduleList.push(module);
    });
    return moduleList;
};