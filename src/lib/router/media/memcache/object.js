const Memcache = require('memcached');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
        this._config = {
            retries: 0,
            timeout: this._connParam.timeout
        }
    }

    async has(id)  {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${id}`;
        return await new Promise((resolve, reject) => {
            memcache.get(key, function (err, object) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                return object !== undefined;
            })
        })
    }

    async set(object) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${object.id}`;
        return await new Promise((resolve, reject) => {
            memcache.set(key, object, 0, function (err) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    }

    async get(id) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${id}`;
        return await new Promise((resolve, reject) => {
            memcache.get(key, function (err, object) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve(object);
            })
        })
    }

    async del(id) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${id}`;
        return await new Promise((resolve, reject) => {
            memcache.del(key, function (err, object) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        })
    }

};