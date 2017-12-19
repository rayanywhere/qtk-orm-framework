const mysql = require('mysql');
const fs = require('fs');
const ObjectRouter = require('../../../object/router');
const RelationSchema = require('../../../relation/schema');
const RelationRouter = require('../../../relation/router');
const {skey, ikey, integer, string, boolean, object, array} = require('../../../lib/validator_parser');


module.exports = async (schemaDir, routerDir, type, module, preview=undefined) => {
    try {
        switch (type) {
            case 'object':
                await build_object_mysql_schema(schemaDir, routerDir, module, preview);
                break;
            case 'relation': 
                await build_relation_mysql_schema(schemaDir, routerDir, module, preview);
                break;
            default:
                console.error('unknown type ' + type);
                process.exit(-1);
        }
    }
    catch (err) {
        console.error(err);
        process.exit(-1);
    }
};


async function build_object_mysql_schema(schemaDir, routerDir, module ,preview) {    
    const shards = ObjectRouter.create(module, `${routerDir}`).getShardsConfig();
    const schema = eval(fs.readFileSync(`${schemaDir}/object/${module.replace(/\./g, '/')}.js`, {encoding:'utf8'}));

    for (let shard of shards) {
        if (shard.media !== 'mysql') {
            continue;
        }

        let {dbSql, tableSql} = generate_object_sqls(module, schema, shard);
        if (!preview) {
            await execute_sql(dbSql, shard);
            await execute_sql(tableSql, shard);
        }
        logger.debug(`connect config: [media => ${shard.media}, host => ${shard.host}, port => ${shard.port}`);
        logger.debug(dbSql);
        logger.debug(tableSql);
    }
}

function generate_object_sqls(module, schema, shard) {
    let dbSql = `CREATE DATABASE IF NOT EXISTS ${shard.database}`;
    let tableSql = '';
    tableSql = `
    CREATE TABLE IF NOT EXISTS ${shard.database}.${shard.table}
    (
        id ${resolveSqlType(schema.properties.id)},
        object JSON,
        PRIMARY KEY(id)
    )`;
    return {dbSql, tableSql};
}

function isIkey(node) {
    if (node.type == 'ikey') return true;
    return false;
}

function extractMinMax(node) {
    return [node.limit.minLen, node.limit.maxLen];
}

async function build_relation_mysql_schema(schemaDir, routerDir, module, preview=undefined) {
    const shards = RelationRouter.create(module, `${routerDir}`).getShardsConfig();
    const schema = eval(fs.readFileSync(`${schemaDir}/relation/${module.replace(/\./g, '/')}.js`, {encoding: 'utf8'}));
    for (let shard of shards) {
        if (shard.media !== 'mysql') {
            continue;
        }
        let {dbSql, tableSql} = generate_relation_sqls(module, schema, shard);
        if (!preview) {
            await execute_sql(dbSql, shard);
            await execute_sql(tableSql, shard);
        }
        logger.debug(`connect config: [media => ${shard.media}, host => ${shard.host}, port => ${shard.port}`);
        logger.debug(dbSql);
        logger.debug(tableSql);
    }
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


function generate_relation_sqls(module, schema, shard) {
    let dbSql = `
    CREATE DATABASE IF NOT EXISTS ${shard.database}`;
    let tableSql = `
    CREATE TABLE IF NOT EXISTS ${shard.database}.${shard.table}
    (
        subject ${resolveSqlType(schema.properties.subject)},  
        object ${resolveSqlType(schema.properties.object)},
    `;
    for (let key of Object.keys(schema.properties)) {
        if (key != 'object' && key != 'subject') {
            tableSql +=
            `    ${key} ${resolveSqlType(schema.properties[key])},`
        }
    }
    tableSql +=
    `
        PRIMARY KEY(subject, object)
    )
    `;
    return {dbSql, tableSql};
}

async function execute_sql(sql, connParam) {
    let connection = mysql.createConnection({
        host : connParam.host,
        port : connParam.port,
        user : connParam.user,
        password : connParam.password
    });

    return await new Promise((resolve, reject) => {
        connection.connect();
        connection.query(sql, (err) => {
            connection.end();
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
