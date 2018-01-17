const Media = require('./media');
const assert = require('assert');

function extractStructure(object) {
    let id = object.id;
    delete object.id;
    return {id, object}
}

module.exports = class {

    constructor(routerPath) {
        this._router = require(routerPath);
        this._hasCache = this._router.cache.shards.length > 0;
        this._hasPersistence = this._router.persistence.length > 0;
        assert(this._hasCache || this._hasPersistence, 'at least one storage media needed');
    }

    _getMedias(id) {
        let cache = undefined;
        let persistence = undefined;
        if (this._hasCache) cache = Media.create(this._router.cache.hash(id));
        if (this._hasPersistence) persistence = Media.create(this._router.persistence.hash(id));
        return {
            cache: cache,
            persistence: persistence
        }
    }

    async has(id) {
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache && await cache.has(id))
            return true;
        return this._hasPersistence && await persistence.has(id);
    }


    async get(id) {
        let {cache, persistence} = this._getMedias(id);
        let object = undefined;
        if (this._hasCache)
            object = await cache.get(id);
        if (object == undefined && this._hasPersistence) {
            object = await persistence.get(id);
            if (this._hasCache && object)
                await cache.set(id, object);
        }
        if (object) object.id = id;
        return object;
    }

    async set(objectItem) {
        let {id, object} = extractStructure(objectItem);
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache)
            await cache.set(id, object);
        if (this._hasPersistence)
            await persistence.set(object);
    }

    async del(id) {
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache)
            await cache.del(id);
        if (this._hasPersistence)
            await persistence.del(id);
    }

};