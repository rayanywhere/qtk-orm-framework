const Mysql = require('mysql');
const MysqlPool = require('./lib/pool');

function toRow(object) {
    let id = object.id;
    delete object.id;
    return {id, object: JSON.stringify(object)};
}

function toObject(row) {
    let object = JSON.parse(row.object);
    object.id = row.id;
    return object;
}

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
    }

    async has(id) {
        const sql = Mysql.format('SELECT count(*) as num FROM ?? WHERE ??=?', [this._connParam.table, 'id', id]);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(parseInt(rows[0].num) > 0);
            });
        });
    }

    async get(id) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'id', id]);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                if (rows.length < 1) {
                    resolve(undefined);
                    return;
                }
                resolve(toObject(rows[0]));
            });
        });
    }

    async set(object) {
        const row = toRow(object);
        const sqlArr = [];
        const dataArr = [this._connParam.table];
        for (const [key, val] of Object.entries(row)) {
            sqlArr.push('??=?');
            dataArr.push(key, val);
        }
        const sql = Mysql.format('REPLACE INTO ?? SET ' + sqlArr.join(','), dataArr);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    async del(id) {
        const sql = Mysql.format('DELETE FROM ?? WHERE ??=?', [this._connParam.table, 'id', id]);
        const mysql = await MysqlPool.fetch(this._connParam);

        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}
