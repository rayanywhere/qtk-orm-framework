#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const walk = require('klaw-sync');

opts.parse(
    [
        { 
            short       : 'd',
            long        : 'dir',
            description : '资源目录',
            value       : true,
            required    : true
        }
    ], true);

const schemaDir = path.resolve(`${opts.get('dir')}/schema`);
const routerDir = path.resolve(`${opts.get('dir')}/router`);

try {
    listModule(schemaDir, routerDir).map(item => console.log(item));
}
catch(err) {
    console.error(err.stack);
    process.exit(-1);
}


function listModule(schemaDir, routerDir) {
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