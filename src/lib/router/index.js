const assert = require('assert');
const fs = require('fs');
const Backend = require('./backend')

module.exports = class Wrapper {
    constructor(name, routerPath) {
        this._routerCurrent = new Router(require(`${routerPath}/${name.replace(/\./g, '/')}.js`));
        if (fs.existsSync(`${routerPath}/${name.replace(/\./g, '/')}.obsolete.js`)) {
            this._routerObsolete = new Router(require(`${routerPath}/${name.replace(/\./g, '/')}.obsolete.js`));
        }
    }

    async get(key) {
        let value = await this._routerCurrent.get(key);
        if ((value === undefined) && (this._routerObsolete !== undefined)) {
            value = await this._routerObsolete.get(key);
            if (value !== undefined) {
                await this._routerCurrent.set(key, value);
            }
        }
        return value;
    }

    async set(key, value) {
        await this._routerCurrent.set(key, value);
    }

    async del(key) {
        const pendings = [this._routerCurrent.del(key)];
        if (this._routerObsolete !== undefined) {
            pendings.push(this._routerObsolete.del(key));
        }
        
        await Promise.all(pendings);
    }
}

class Router {
    constructor({cache, persistence}) {
        this._cache = cache;
        this._persistence = persistence;
        assert(this._cache !== undefined || this._persistence !== undefined, `either cache and persistence is needed in router sepcification`);
    }

    _resolveMedia(key) {
        let cache = undefined;
        let persistence = undefined;
        if (this._cache !== undefined) {
            cache = Backend.create(this._cache, key);
        }
        if (this._persistence !== undefined) {
            persistence = Backend.create(this._persistence, key);
        }
        return {cache, persistence};
    }

    async get(key) {
        const {cache, persistence} = this._resolveMedia(key);
        let value = undefined;
        if (cache !== undefined) {
            value = await cache.get(key);
        }

        if (value !== undefined) {
            return value;
        }

        if (persistence !== undefined) {
            value = await persistence.get(key);
        }
        return value;
   }

    async set(key, value) {
        const {cache, persistence} = this._resolveMedia(key);
        const pendings = [];
        if (cache !== undefined) {
            pendings.push(cache.set(key, value));
        }
        if (persistence !== undefined) {
            pendings.push(persistence.set(key, value));
        }
        await Promise.all(pendings);
    }

    async del(key) {
        const {cache, persistence} = this._resolveMedia(key);
        const pendings = [];
        if (cache !== undefined) {
            pendings.push(cache.del(key));
        }
        if (persistence !== undefined) {
            pendings.push(persistence.del(key));
        }
        await Promise.all(pendings);
    }
}