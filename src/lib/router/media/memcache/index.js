const Memcache = require('memcached');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
        this._config = {
            retries: 0,
            timeout: this._connParam.timeout
        }
    }

    async has(key) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        key = `${this._connParam.prefix}${key}`;
        return await new Promise((resolve, reject) => {
            memcache.get(key, function (err, data) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                if (data) {
                    resolve(true);
                    return;
                }
                resolve(false)
            })
        });
    }

    async set(key, data) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        key = `${this._connParam.prefix}${key}`;
        return await new Promise((resolve, reject) => {
            memcache.set(key, JSON.stringify(data), 0, function (err) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    }

    async get(key) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        key = `${this._connParam.prefix}${key}`;
        return await new Promise((resolve, reject) => {
            memcache.get(key, function (err, data) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                if (data) {
                    resolve(JSON.parse(data));
                    return;
                }
                resolve(undefined);
                return;
            })
        })
    }

    async del(key) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        key = `${this._connParam.prefix}${key}`;
        return await new Promise((resolve, reject) => {
            memcache.del(key, function (err, data) {
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