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
        this._router = require(`${config.path}/object/${name.replace(/\./g, '/')}/router.js`);
    }

    find(id) {
        const connParam = this._router.hash(id);
        return Storage.create(connParam);
    }
}