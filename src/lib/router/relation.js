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
        let relation = undefined;
        if (this._hasCache) {
            relation = await Media.create(TYPE, this._router.cache.hash(subject)).fetch(subject, object);
        }
        if (relation == undefined && this._hasPersistence) {
            relation = await Media.create(TYPE, this._router.persistence.hash(subject)).fetch(subject, object);
        }
        return relation;
    }

    async put(relation) {
        if (this._hasCache)
            await Media.create(TYPE, this._router.cache.hash(relation.subject)).put(relation);
        if (this._hasPersistence)
            await Media.create(TYPE, this._router.persistence.hash(relation.subject)).put(relation);
    }

    async has(subject, object) {
        if (this._hasCache && await Media.create(TYPE, this._router.cache.hash(subject)).has(subject, object))
            return true;
        return this._hasPersistence && await Media.create(TYPE, this._router.persistence.hash(subject).has(subject, object));
    }

    async remove(subject, object) {
        if (this._hasCache)
            await Media.create(TYPE, this._router.cache.hash(subject)).remove(subject, object);
        if (this._hasPersistence)
            await Media.create(TYPE, this._router.persistence.hash(subject)).remove(subject, object);
    }

    async removeAll(subject) {
        if (this._hasCache)
            await Media.create(TYPE, this._router.cache.hash(subject)).removeAll(subject);
        if (this._hasPersistence)
            await Media.create(TYPE, this._router.persistence.hash(subject)).removeAll(subject);
    }

    async count(subject) {
        if (this._hasCache)
            return await Media.create(TYPE, this._router.cache.hash(subject)).count(subject);

    }

    async  list(subject, property, order, offset=undefined, number=undefined) {

    }
};
