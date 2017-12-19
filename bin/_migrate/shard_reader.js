const mysqlPool = require('../../src/lib/mysql_pool');
const Mysql = require('mysql');

async function count(shard) {
    let mysql = await mysqlPool.fetch(shard);
    const sql = Mysql.format('SELECT count(*) as num FROM ??.??', [shard.database, shard.table]);
    return await new Promise((resolve, reject) => {
        mysql.query(sql, (error, rows, fields) => {
            mysql.release();
            error ? reject(error) : resolve(rows[0].num);
        });
    });
}

async function dumpObject(shard, limit) {
    let mysql = await mysqlPool.fetch(shard);
    const sql = Mysql.format('SELECT * FROM ??.?? LIMIT ?, ?', [shard.database, shard.table, ...limit]);
    return await new Promise((resolve, reject) => {
        mysql.query(sql, (error, rows, fields) => {
            mysql.release();
            error ? reject(error) : resolve(rows.map(row => {
                let object = JSON.parse(row.object);
                object.id = row.id;
                return object;
            }));
        });
    });
}

async function dumpRelation(shard, limit) {
    let mysql = await mysqlPool.fetch(shard);
    const sql = Mysql.format('SELECT * FROM ??.?? LIMIT ?, ?', [shard.database, shard.table, ...limit]);
    return await new Promise((resolve, reject) => {
        mysql.query(sql, (error, rows, fields) => {
            mysql.release();
            error ? reject(error) : resolve(rows.map(row => {
                let relation = JSON.parse(row.relation);
                relation.subject = row.subject;
                relation.object = row.object;
                return relation;
            }));
        });
    });
}

module.exports = {
    count,
    dumpObject,
    dumpRelation
}