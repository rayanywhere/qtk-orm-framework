const Mysql = require('mysql');
const fs = require('fs');
const {skey, ikey, integer, string, boolean, object, array} = require('../../../src/lib/validator_parser');

module.exports = class {
    constructor(schemaDir, routerDir, type,  moduleName) {
        this._type = type;
        if (type == 'object') {
            this._shards = require(`${routerDir}/object/${moduleName.replace(/\./g, '/')}.js`).persistence.shards;
            this._schema = eval(fs.readFileSync(`${schemaDir}/object/${moduleName.replace(/\./g, '/')}.js`, {encoding:'utf8'}));
        } else {
            this._shards = require(`${routerDir}/relation/${moduleName.replace(/\./g, '/')}.js`).persistence.shards;
            this._schema = eval(fs.readFileSync(`${schemaDir}/relation/${moduleName.replace(/\./g, '/')}.js`, {encoding:'utf8'}));
        }
    }

    exec() {
        const actions = [];
        for (let shard of this._shards) {
            if (shard.media !== 'mysql') {
                continue;
            }
            actions.push(Object.assign({sql: Mysql.format(`CREATE DATABASE IF NOT EXISTS ??`, [shard.database])}, shard));
            if (this._type == 'object') {
                actions.push(Object.assign({sql: this._generateObjectSql(shard)}, shard));
            } else {
                actions.push(Object.assign({sql: this._generateRelationSql(shard)}, shard))
            }
        }
        return actions;
    }


    _generateObjectSql(shard) {
        return  Mysql.format(
        `CREATE TABLE IF NOT EXISTS ??.??
        (
            \`id\` ${resolveSqlType(this._schema.properties.id)},
            \`data\` JSON,
            PRIMARY KEY(id)
        )`, [shard.database, shard.table]);
    }

    _generateRelationSql(shard) {
        let params = [shard.database, shard.table];
        let sql = 
        `CREATE TABLE IF NOT EXISTS ??.??
        (
            \`id\` ${resolveSqlType(this._schema.properties.subject)},
            \`data\` JSON,
            PRIMARY KEY(\`id\`)
        )
        `;
        return Mysql.format(sql, params);
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