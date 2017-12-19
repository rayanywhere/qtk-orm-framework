const fs = require('fs');
const cache = new Map();
const Storage = require('./storage');

module.exports = class {
    static create(name, routerPath) {
        const fileName = `${routerPath}/relation/${name.replace(/\./g, '/')}.js`
        return new this(fileName);
    }

    constructor(fileName) {
        this._router = require(fileName);
    }

    find(id) {
        const connParam = this._router.hash(id);
        return Storage.create(connParam);
    }

    getShardsConfig() {
        return this._router.shards;
    }
}