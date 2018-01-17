const Mysql = require('mysql');
const MysqlPool = require('./lib/pool');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
    }

    async has(key) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'id', key]);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                if (rows.length < 1) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    async get(key) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'id', key]);
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
                resolve(JSON.parse(rows[0]));
            });
        });
    }

    async set(key, data) {
        const sql = Mysql.format('REPLACE INTO ?? SET ??=?, ??=?', [this._connParam.table, 'id', key, 'data', JSON.stringify(data)]);
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

    async del(key) {
        const sql = Mysql.format('DELETE FROM ?? WHERE ??=?', [this._connParam.table, 'id', key]);
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
