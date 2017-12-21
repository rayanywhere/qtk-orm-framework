const Mysql = require('mysql');
const MysqlPool = require('../../../../lib/mysql_pool');

function toRow(relation) {
    let subject = relation.subject;
    let object = relation.object;
    delete relation.subject;
    delete relation.object;
    return {subject, object, relation: JSON.stringify(relation)};
}

function toRelation(row) {
    let relation = JSON.parse(row.relation);
    relation.subject = row.subject;
    relation.object = row.object;
    return relation;
}

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
    }

    async fetch(subject, object) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=? AND ??=?', [this._connParam.table, 'subject', subject, 'object', object]);
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
                resolve(toRelation(rows[0]));
            });
        });
    }

    async put(relation) {
        const row = toRow(relation);
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

    async has(subject, object) {
        return (await this.fetch(subject, object) !== null);
    }

    async remove(subject, object) {
        const sql = Mysql.format('DELETE FROM ?? WHERE ??=? AND ??=?', [this._connParam.table, 'subject', subject, 'object', object]);
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

    async removeAll(subject) {
        const sql = Mysql.format('DELETE FROM ?? WHERE ??=?', [this._connParam.table, 'subject', subject]);
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

    async count(subject) {
        const sql = Mysql.format('SELECT count(*) as num FROM ?? WHERE ??=?', [this._connParam.table, 'subject', subject]);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(parseInt(rows[0].num));
            });
        });
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        let preparedSql;
        if(property === 'subject' || property === 'object') {
            preparedSql = `SELECT * FROM ?? WHERE \`subject\`=? ORDER BY ?? ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
        }
        else {
            property = `$.${property}`;
            preparedSql = `SELECT * FROM ?? WHERE \`subject\`=? ORDER BY relation->>? ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
        }
        let params = [this._connParam.table, subject, property];
        if ((typeof number === 'number') && (typeof offset === 'number')) {
            preparedSql += " LIMIT ?,?";
            params.push(offset);
            params.push(number);
        }
        else if (typeof number === 'number') {
            preparedSql += " LIMIT ?";
            params.push(number);
        }
        else if (typeof offset === 'number') {
            preparedSql += " LIMIT ?,9999999999999";
            params.push(offset);
        }
        const sql = Mysql.format(preparedSql, params);
        const mysql = await MysqlPool.fetch(this._connParam);

        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(rows.map(toRelation));
            });
        });
    }
}