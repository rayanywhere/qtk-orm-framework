const Mysql = require('mysql');
const MysqlPool = require('./lib/pool');

function extractStructure(abstractRelation) {
    let subject = abstractRelation.subject;
    let object = abstractRelation.object;
    delete abstractRelation.subject;
    delete abstractRelation.object;
    return {subject, object, abstractRelation}
}

function rowToRealRelation(row) {
    let subject = row.subject;
    let relation = JSON.parse(row.relation);
    return {subject, relation};
}


module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
    }

    async fetch(subject, object) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'subject', subject]);
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
                let {subject, relation} = rowToRealRelation(rows[0]);
                if (!relation[object]) {
                    resolve(undefined);
                    return;
                } else {
                    relation[object].subject = subject;
                    relation[object].object = object;
                    resolve(relation);
                    return;
                }
            })
        });
    }

    async _fetchAll(subject) {
        const sql = Mysql.format('SELECT * FROM ?? WHERE ??=?', [this._connParam.table, 'subject', subject]);
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
                resolve(rowToRealRelation(rows[0]).relation);
                return;
            })
        });
    }

    async put(abstractRelation) {
        let {subject, object, relation} = extractStructure(abstractRelation);
        let relations = await this._fetchAll(subject);
        if (relations) {
            relations[object] = relation;
        } else {
            relations = {};
            relations[object] = relation;
        }
        const sql = Mysql.format('REPLACE INTO ?? SET ??=? , ??=?', [this._connParam.table, 'subject', subject, 'relation', JSON.stringify(data)]);
        const mysql = await MysqlPool.fetch(this._connParam);
        return await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            })
        });
    }

    async has(subject, object) {
        return (await this.fetch(subject, object) !== undefined);
    }

    async remove(subject, object) {
        let relations = await this._fetchAll(subject);
        if (relations && relations[object]) {
            delete relations[object];
            const sql = Mysql.format('REPLACE INTO ?? SET ??=? , ??=?', [this._connParam.table, 'subject', subject, 'relation', JSON.stringify(data)]);
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
        let relations = await this._fetchAll(subject);
        return relations ? [...Object.keys(relations)].length : 0;
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        let relations = await this._fetchAll(subject);
        for (let object in relations) {
            relations[object].subject = subject;
            relations[object].object = object;
        }
        let compare = function (a, b) {
            let params = property.split('.');
            for (let param of params) {
                a = a[param];
                b = b[param];
            }
            if (order == 'DESC') {
                return a > b ? -1 : 1;
            } else {
                return a > b ? 1 : -1;
            }
        };
        relations = [...Object.values(relations)];
        relations.sort(compare);
        if (offset && number) {
            relations.splice(0, offset);
            relations.splice(number)
        }
        return relations;
    }
}

