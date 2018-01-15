const Memcache = require('memcached');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
        this._config = {
            retries: 0,
            timeout: this._connParam.timeout
        }
    }

    async

}