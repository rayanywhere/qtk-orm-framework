const Mysql = require('mysql');
const MysqlPool = require('../../../../lib/mysql_pool');

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
        const sql = Mysql.format('SELECT data FROM ?? WHERE ??=?', [this._connParam.table, 'id', id]);
		const mysql = await MysqlPool.fetch(this._connParam);
		return await new Promise((resolve, reject) => {
			mysql.query(sql, (error, rows, fields) => {
				mysql.release();
				if (error) {
					reject(error);
					return;
				}
				if (rows.length < 1) {
					resolve(null);
					return;
                }
                let object = JSON.parse(rows[0].data);
                object.id = id;
				resolve(object);
			});
		});
    }

    async set(object) {
		const id = object.id;
        const data = Object.assign({}, object);
        delete data.id;

        const sql = Mysql.format('REPLACE INTO ?? SET ??=?, ??=?', [this._connParam.table, 'id', id, 'data', JSON.stringify(data)]);
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
