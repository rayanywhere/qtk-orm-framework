const Media = require('./media');
const assert = require('assert');
const TYPE = 'relation';

module.exports = class {

    constructor(routerPath) {
        this._router = require(routerPath);
        this._hasCache = this._router.cache.shards.length > 0;
        this._hasPersistence = this._router.persistence.length > 0;
        assert(this._hasCache || this._hasPersistence, 'at least one storage media needed');
    }

    async fetch(subject, object) {

    }

    async put(subject) {

    }

    async has(subject, object) {

    }

    async remove(subject, object) {

    }

    async removeAll(subject) {

    }

    async count(subject) {

    }

    async  list(subject, property, order, offset=undefined, number=undefined) {

    }
};
