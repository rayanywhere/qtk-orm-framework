const Mysql = require('mysql');
const fs = require('fs');

module.exports = class {
    constructor(keyspec, routerDir, moduleName) {
        this._keyspec = keyspec;
        const router = require(`${routerDir}/${moduleName.replace(/\./g, '/')}.js`);
        this._shards = router.persistence ? router.persistence.shards : [];
    }

    exec() {
        const actions = [];
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') {
                continue;
            }
            actions.push(Object.assign({sql: Mysql.format(`CREATE DATABASE IF NOT EXISTS ??`, [shard.database])}, shard));
            actions.push(Object.assign({sql: this._generateSql(shard)}, shard));
        }
        return actions;
    }


    _generateSql(shard) {
        return  Mysql.format(
        `CREATE TABLE IF NOT EXISTS ??.??
        (
            \`id\` ${this._keyspec},
            \`data\` JSON,
            PRIMARY KEY(id)
        )`, [shard.database, shard.table]);
    }
}