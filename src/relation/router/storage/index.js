const MysqlStorage = require('./mysql');

module.exports = class {
    static create(connParam) {
        switch(connParam.media) {
            case 'mysql':
                return new MysqlStorage(connParam);
                break;
        }
        throw new Error(`unsupported media ${connParam.media}`);
    }
}