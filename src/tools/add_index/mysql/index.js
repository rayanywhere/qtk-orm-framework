const mysql = require('mysql');
const fs = require('fs');
const RelationSchema = require('../../../relation/schema');
const RelationRouter = require('../../../relation/router');
const {skey, ikey, integer, string, boolean, object, array} = require('../../../lib/validator_parser');


module.exports = async (schemaDir, routerDir, type, module, field, preview=undefined) => {
    try {
        await add_relation_index(schemaDir, routerDir, module, field, preview)
    }
    catch (err) {
        console.error(err);
        process.exit(-1);
    }
};

async function add_relation_index(schemaDir, routerDir, module, field, preview) {    
    const shards = RelationRouter.create(module, `${routerDir}`).getShardsConfig();
    const schema = eval(fs.readFileSync(`${schemaDir}/relation/${module.replace(/\./g, '/')}.js`, {encoding:'utf8'}));

    for (let shard of shards) {
        if (shard.media !== 'mysql') {
            continue;
        }

        let indexSql = generate_index_sqls(module, schema, shard, field);
        if (!preview) {
            await execute_sql(indexSql, shard);
        }
        logger.debug(`connect config: [media => ${shard.media}, host => ${shard.host}, port => ${shard.port}`);
        logger.debug(indexSql);
    }
}

function generate_index_sqls(module, schema, shard, field) {
    let indexSql = `
    ALTER TABLE ${shard.database}.${shard.table} ADD INDEX ${field}(${field})`;
    return indexSql;
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
