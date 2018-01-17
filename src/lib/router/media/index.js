const Memcache = require('./memcache');
const Mysql = require('./mysql');


module.exports = class {
    static create(connParam) {
        switch (connParam.media) {
            case 'mysql': return new Mysql(connParam);
            case 'memcache': return new Memcache(connParam);
            default:
                throw new Error(`unsupported storage[${connParam.media}]`);
        }

    }
}