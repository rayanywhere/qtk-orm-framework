const MysqlStorage = require('./mysql');
const MemcacheStorage = require('./memcache');

module.exports = class {
    static create(connParam) {
        switch(connParam.media) {
            case 'mysql':
                return new MysqlStorage(connParam);
                break;
            case 'memcache':
                return new MemcacheStorage(connParam);
                break;
        }
        throw new Error(`unsupported media ${connParam.media}`);
    }
};