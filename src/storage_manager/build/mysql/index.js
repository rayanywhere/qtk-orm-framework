const mysql = require('mysql');
const ObjectSchema = require('../../../object/schema');
const ObjectRouter = require('../../../object/router');
const RelationSchema = require('../../../relation/schema');
const RelationRouter = require('../../../relation/router');


module.exports = async (type, sourcePath, module) => {
    try {
        switch (type) {
            case 'object':
                await build_object_mysql_schema(module, sourcePath);
                break;
            case 'relation':
                await build_relation_mysql_schema(module, sourcePath);
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


async function build_object_mysql_schema(module, path) {
    const schema = ObjectSchema.create(module, `${path}/schema`);
    const router = ObjectRouter.create(module, `${path}/router`)._router;

    for (let idx = 0; idx < router.shards.length; ++idx) {
        const shards = router.shards[idx];
        if (shards.media !== 'mysql') {
            continue;
        }

        let {dbSql, tableSql} = generate_object_sqls(module, schema, shards, idx);
        await execute_sql(dbSql, shards);
        await execute_sql(tableSql, shards);
    }
}

function generate_object_sqls(module, schema, shards, idx) {
    let dbSql = `CREATE DATABASE IF NOT EXISTS ${shards.database}`;
    let tableSql = '';

    const table = shards.table;
    console.log(schema);return;
    if (schema.isIntegerId) {
        tableSql = `CREATE TABLE IF NOT EXISTS ${table}(\`id\` INTEGER PRIMARY KEY, object JSON)`;
    }
    else {
        if (schema.id.maxLength === schema.id.minLength) {
            tableSql = `CREATE TABLE IF NOT EXISTS ${table}(\`id\` CHAR(${schema.id.maxLength}) PRIMARY KEY, data MEDIUMBLOB)`;
        }
        else {
            tableSql = `CREATE TABLE IF NOT EXISTS ${table}(\`id\` VARCHAR(${schema.id.maxLength}) PRIMARY KEY, data MEDIUMBLOB)`;
        }
    }
    return {dbSql, tableSql};
}

async function build_relation_mysql_schema(module, path) {
    const schema = new RelationSchema(module, `${path}/schema`);
    const router = new RelationRouter(module, `${path}/router`);
    for (let idx = 0; idx < router.shardss.length; ++idx) {
        const shards = router.shardss[idx];
        if (shards.media !== 'mysql') {
            continue;
        }

        let {dbSql, tableSql} = generate_relation_sqls(module, schema, shards, idx);
        await execute_sql(dbSql, shards);
        await execute_sql(tableSql, shards);
    }
}

function generate_relation_sqls(module, schema, shards, idx) {
    let dbSql = `CREATE DATABASE IF NOT EXISTS ${shards.database}`;
    const table = `${shards.database}.r_${module.replace(/\./g, '_')}_${printf('%03d', idx)}`;

    let tableSql = `CREATE TABLE IF NOT EXISTS ${table}(`;
    if (schema.isIntegerSubjectId) {
        tableSql += 'subjectId INTEGER';
    }
    else {
        if (schema.subjectId.minLength === schema.subjectId.maxLength) {
            tableSql += `subjectId CHAR(${schema.subjectId.maxLength})`;
        }
        else {
            tableSql += `subjectId VARCHAR(${schema.subjectId.maxLength})`;
        }
    }
    if (schema.isIntegerObjectId) {
        tableSql += ',objectId INTEGER';
    }
    else {
        if (schema.objectId.minLength === schema.objectId.maxLength) {
            tableSql += `,objectId CHAR(${schema.objectId.maxLength})`;
        }
        else {
            tableSql += `,objectId VARCHAR(${schema.objectId.maxLength})`;
        }
    }
    for (let fieldName in schema.relation.properties) {
        let fieldValue = schema.relation.properties[fieldName];
        switch(fieldValue.type) {
            case "integer":
                tableSql += `,${fieldName} INTEGER NOT NULL`;
                break;
            case "string":
                tableSql += `,${fieldName} VARCHAR(255)`;
                break;
            default:
                throw new Error(`unknown relation type ${fieldValue.type}`);
                break;
        }
    }
    for (let fieldName in schema.relation.properties) {
        tableSql += `,INDEX(${fieldName})`;
    }
    tableSql += ',INDEX(subjectId),PRIMARY KEY(subjectId, objectId))';
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
