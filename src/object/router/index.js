const fs = require('fs');
const cache = new Map();
const Storage = require('./storage');

module.exports = class {
    static create(name, routerPath) {
        const fileName = `${routerPath}/object/${name.replace(/\./g, '/')}.js`
        return new this(fileName);
    }

    constructor(fileName) {
        this._router = require(fileName);
    }

    findPersistence(id) {
        const connParam = this._router.persistence.hash(id);
        return Storage.create(connParam);
    }

    findCache(id) {
        const connParam = this._router.cache.hash(id);
        return Storage.create(connParam);
    }

    hasCache() {
        return this._router.cache !== undefined;
    }
}