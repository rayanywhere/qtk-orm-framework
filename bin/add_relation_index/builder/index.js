const Mysql = require('mysql');

module.exports = class {
    constructor(schemaDir, routerDir, moduleName, field) {
        this._field = field;
        this._shards = require(`${routerDir}/relation/${moduleName.replace(/\./g, '/')}.js`).shards;
    }

    exec() {
        const actions = [];
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') {
                continue;
            }
            actions.push(Object.assign({sql: Mysql.format('ALTER TABLE ??.?? ADD INDEX ??(??)', [shard.database, shard.table, this._field, this._field])}, shard));
        }
        return actions;
    }
}