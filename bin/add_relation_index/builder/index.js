const Mysql = require('mysql');
const fs = require('fs');
const {skey, ikey, integer, string, boolean, object, array} = require('../../../src/lib/validator_parser');

module.exports = class {
    constructor(schemaDir, routerDir, moduleName, field) {
        this._field = field;
        this._shards = require(`${routerDir}/relation/${moduleName.replace(/\./g, '/')}.js`).shards;
        this._schema = eval(fs.readFileSync(`${schemaDir}/relation/${moduleName.replace(/\./g, '/')}.js`, {encoding:'utf8'}));
    }

    exec() {
        const actions = [];
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') {
                continue;
            }
            actions.push(Object.assign({sql: Mysql.format(`ALTER TABLE ??.?? ADD COLUMN ?? ${resolveSqlType(this._schema.properties[this._field])} GENERATED ALWAYS AS (relation->"$.${this._field}") `, [shard.database, shard.table, this._field, this._field])}, shard));
            actions.push(Object.assign({sql: Mysql.format('ALTER TABLE ??.?? ADD INDEX ??(??)', [shard.database, shard.table, this._field, this._field])}, shard));
        }
        return actions;
    }
}

function extractMinMax(node) {
    return [node.limit.minLen, node.limit.maxLen];
}

function resolveSqlType(node) {
    if (node.type == 'ikey') {
        return `INTEGER`;
    } else {
        let [minLen, maxLen] = extractMinMax(node);
        if (minLen === maxLen) {
            return `CHAR(${maxLen})`;
        } else {
            return `VARCHAR(${maxLen})`;
        }
    }
}
