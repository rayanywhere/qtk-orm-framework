const Mysql = require('mysql');
const fs = require('fs');

module.exports = class {
    constructor(routerDir, moduleName) {
        const router = require(`${routerDir}/${moduleName.replace(/\./g, '/')}.js`);
        this._shards = router.persistence ? router.persistence.shards : [];
    }

    exec() {
        const actions = [];
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') {
                continue;
            }
            actions.push(Object.assign({sql: this._generateSql(shard)}, shard));
        }
        return actions;
    }


    _generateSql(shard) {
        return  Mysql.format(`DROP TABLE IF EXISTS ??.??`, [shard.database, shard.table]);
    }
}