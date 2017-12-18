#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const storageManager = require(`${__dirname}/../src/storage_manager`);

const halt = (msg) => {
    console.error(msg);
    process.exit(-1);
};

if (process.argv.length !== 4) {
    halt('usage: list_module <source_path> <type>');
}

const sourcePath= path.resolve(process.argv[2]);
const type      = process.argv[3].toLowerCase();

if (!['object', 'relation'].includes(type)) {
    halt(`type [object|relation] required`);
}

if (!fs.existsSync(`${sourcePath}/router`)) {
    halt(`${sourcePath}/router is not exist`);
}

if (!fs.existsSync(`${sourcePath}/schema`)) {
    halt(`${sourcePath}/schema is not exist`);
}

storageManager.list(sourcePath, process.argv[3]).map(item => console.log(item));