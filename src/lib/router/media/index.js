const Memcache = require('./memcache');
const Mysql = require('./mysql');


module.exports = class {
    static create(connParam) {
        switch (connParam.media) {
            case 'mysql': return new Memcache(connParam);
            case 'memcache': return new Mysql(connParam);
            default:
                throw new Error(`unsupported storage[${connParam.media}]`);
        }

    }
}