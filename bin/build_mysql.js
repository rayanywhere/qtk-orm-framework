#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const storageManager = require(`${__dirname}/../src/storage_manager`);

const halt = (msg) => {
    console.error(msg);
    process.exit(-1);
};

if (process.argv.length !== 5) {
    halt('usage: build_mysql <source_path> <type> <module>');
}

const sourcePath = path.resolve(process.argv[2]);
const type = process.argv[3].toLowerCase();
const moduleName = process.argv[4];

if (!['object', 'relation'].includes(type)) {
    halt(`type [object|relation] required`);
}

const schemaFile = `${sourcePath}/schema/${type}/${moduleName.replace(/\./g, '/')}.js`;
const routerFile = `${sourcePath}/router/${type}/${moduleName.replace(/\./g, '/')}.js`;

if (!fs.existsSync(schemaFile)) {
    halt(`${schemaFile} is not exist`);
}

if (!fs.existsSync(`${routerFile}`)) {
    halt(`${sourcePath} is not exist`);
}


storageManager.build('mysql', type, sourcePath, moduleName);