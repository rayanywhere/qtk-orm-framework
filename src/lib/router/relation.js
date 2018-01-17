const Media = require('./media');
const assert = require('assert');

function extractStructure(relation) {
    let subject = relation.subject;
    let object = relation.object;
    delete relation.subject;
    delete relation.object;
    return {subject, object, relation}
}

module.exports = class {

    constructor(routerPath) {
        this._router = require(routerPath);
        this._hasCache = this._router.cache.shards.length > 0;
        this._hasPersistence = this._router.persistence.length > 0;
        assert(this._hasCache || this._hasPersistence, 'at least one storage media needed');
    }

    _getMedias(subject) {
        let cache = undefined;
        let persistence = undefined;
        if (this._hasCache) cache = Media.create(this._router.cache.hash(subject));
        if (this._hasPersistence) persistence = Media.create(this._router.persistence.hash(subject));
        return {
            cache: cache,
            persistence: persistence
        }
    }

    async _getRelations(subject, cache=undefined, persistence=undefined) {
        let relations = undefined;
        if (this._hasCache && cache)
            relations = await cache.get(subject);
        if (relations == undefined && this._hasPersistence && persistence) {
            relations = await persistence.get(subject);
            if (relations)
                await cache.set(subject, relations);
        }
        return relations;
    }

    async _saveRelations(subject, relations,  cache=undefined, persistence=undefined) {
        if (this._hasCache && cache)
            await cache.set(subject, relations);
        if (this._hasPersistence && persistence)
            await persistence.set(subject, relations);
    }

    async isKeyExist(subject) {
        let {cache, persistence} = this._getMedias(subject);
        if (this._hasCache && await cache.has(subject)) {
            return true;
        }
        return this._hasPersistence && await persistence.has(subject);
    }

    async setRaw(subject, relations) {
        let {cache, persistence} = this._getMedias(subject);
        await this._saveRelations(subject, relations, cache, persistence);
    }

    async getRaw(subject) {
        let {cache, persistence} = this._getMedias(subject);
        let relations = undefined;
        if (this._hasCache)
            relations = await cache.get(subject);
        if (relations == undefined && this._hasPersistence) {
            relations = await persistence.get(subject);
        }
        return relations;
    }

    async fetch(subject, object) {
        let {cache, persistence} = this._getMedias(subject);
        let relations = await this._getRelations(subject, cache, persistence);
        if (relations && relations[object]) {
            let relation = relations[object];
            relation.subject = subject;
            relation.object = object;
            return relation;
        }
        return undefined;
    }

    async put(relationItem) {
        let {subject, object, relation} = extractStructure(relationItem);
        let {cache, persistence} = this._getMedias(subject);
        let relations = await this._getRelations(subject, cache, persistence);
        if (relations == undefined) {
            relations = {};
        }
        relations[object] = relation;
        await this._saveRelations(subject, relations, cache, persistence);
    }

    async has(subject, object) {
        return (await this.fetch(subject, object) !== undefined);
    }

    async remove(subject, object) {
        let {cache, persistence} = this._getMedias(subject);
        let relations = await this._getRelations(subject, cache, persistence);
        if (relations !== undefined) {
            delete relations[object];
            await this._saveRelations(subject, relations, cache, persistence);
        }
    }

    async removeAll(subject) {
        let {cache, persistence} = this._getMedias(subject);
        await this._saveRelations(subject, {}, cache, persistence);
    }

    async count(subject) {
        let {cache, persistence} = this._getMedias(subject);
        let relations = await this._getRelations(subject, cache, persistence);
        return relations ? [...Object.keys(relations)].length : 0;
    }

    async list(subject, property, order, offset=undefined, number=undefined) {
        let {cache, persistence} = this._getMedias(subject);
        let relations = await this._getRelations(subject, cache, persistence);
        if (relations) {
            for (let object in relations) {
                relations[object].subject = subject;
                relations[object].object = object;
            }
            let compare = function (a, b) {
                let params = property.split('.');
                for (let param of params) {
                    a = a[param];
                    b = b[param];
                }
                if (order == 'DESC') {
                    return a > b ? -1 : 1;
                } else {
                    return a > b ? 1 : -1;
                }
            };
            relations = [...Object.values(relations)];
            relations.sort(compare);
            if (offset && number) {
                relations.splice(0, offset);
                relations.splice(number)
            }
            return relations;
        } else {
            return [];
        }
    }
};
