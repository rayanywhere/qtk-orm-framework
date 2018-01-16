const Media = require('./media');
const assert = require('assert');
const TYPE = 'object';

module.exports = class {

    constructor(routerPath) {
        this._router = require(routerPath);
        this._hasCache = this._router.cache.shards.length > 0;
        this._hasPersistence = this._router.persistence.length > 0;
        assert(this._hasCache || this._hasPersistence, 'at least one storage media needed');
    }

    async has(id) {
        if (this._hasCache && await Media.create(TYPE, this._router.cache.hash(id)).has(id))
            return true;
        return this._hasPersistence && await Media.create(TYPE, this._router.persistence.hash(id).has(id));
    }


    async get(id) {
        let object = undefined;
        if (this._hasCache)
            object = await Media.create(TYPE, this._router.cache.hash(id)).get(id);
        if (object == undefined && this._hasPersistence) {
            object = await Media.create(TYPE, this._router.persistence.hash(id)).get(id);
            if (this._hasCache && object)
                await Media.create(TYPE, this._router.cache.hash(id)).set(object);
        }
        return object;
    }

    async set(object) {
        if (this._hasCache)
            await Media.create(TYPE, this._router.cache.hash(object.id)).set(object);
        if (this._hasPersistence)
            await Media.create(TYPE, this._router.persistence.hash(object.id)).set(object);
    }

    async del(id) {
        if (this._hasCache)
            await Media.create(TYPE, this._router.cache.hash(id)).del(id);
        if (this._hasPersistence)
            await Media.create(TYPE, this._router.persistence.hash(id)).del(id);
    }

};