const assert = require('assert');
const Media = require('./media')

module.exports = class {

    constructor(routerPath) {
        this._router = require(routerPath);
        this._hasCache = this._router.cache && this._router.cache.shards.length > 0;
        this._hasPersistence = this._router.persistence && this._router.persistence.shards.length > 0;
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

    async hasKey(id) {
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache && await cache.has(id)) {
            return true;
        }
        return this._hasPersistence && await persistence.has(id);
    }

    async delKey(id) {
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache)
            await cache.del(id);
        if (this._hasPersistence)
            await persistence.del(id);
    }

    async setKey(id, data) {
        let {cache, persistence} = this._getMedias(id);
        if (this._hasCache)
            await cache.set(id, data);
        if (this._hasPersistence)
            await persistence.set(id, data);
    }

    async getKey(id) {
        let {cache, persistence} = this._getMedias(id);
        let object = undefined;
        if (this._hasCache)
            object = await cache.get(id);
        if (object == undefined && this._hasPersistence) {
            object = await persistence.get(id);
            if (this._hasCache && object)
                await cache.set(id, object);
        }
        return object;
    }

}