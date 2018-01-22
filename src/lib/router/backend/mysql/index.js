const Mysql = require('mysql');
const Pool = require('./pool');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
    }

    async get(key) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'id', key]);
        const mysql = await Pool.fetch(this._connParam);
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
                resolve(JSON.parse(rows[0].data));
            });
        });
    }

    async set(key, value) {
        const sql = Mysql.format('REPLACE INTO ?? SET ??=?, ??=?', [this._connParam.table, 'id', key, 'data', JSON.stringify(value)]);
        const mysql = await Pool.fetch(this._connParam);
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
        const mysql = await Pool.fetch(this._connParam);
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
