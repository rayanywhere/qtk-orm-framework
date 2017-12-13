const fs = require('fs');
const cache = new Map();
const config = require('../../../config');
const Storage = require('./storage');

module.exports = class {
    static create(name) {
        if (cache.has(name)) {
            return cache.get(name);
        }

        const router = new this(name);
        cache.set(name, router);
        return router;
    }

    constructor(name) {
        const {shards, hash} = require(`${config.path}/object/${name.replace(/\./g, '/')}/router.js`);
        this._shards = shards;
        this._hash = hash;
    }

    find(id) {
        const connParam = this._hash(id);
        return Storage.create(connParam);
    }
}