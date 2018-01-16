const Memcache = require('memcached');

function extractStructure(abstractRelation) {
    let subject = abstractRelation.subject;
    let object = abstractRelation.object;
    delete abstractRelation.subject;
    delete abstractRelation.object;
    return {subject, object, abstractRelation}
}


module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
        this._config = {
            retries: 0,
            timeout: this._connParam.timeout
        }
    }

    async fetch(subject, object) {
        const key = `${this._connParam.prefix}${subject}`;
        let relations = await this._fetchAll(subject);
        if (relations[object]) {
            let relation = relations[object];
            relation.subject = subject;
            relation.object = object;
            return relation;
        } else {
            return undefined;
        }
    }

    async _fetchAll(subject) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${subject}`;
        return await new Promise((resolve, reject) => {
            memcache.get(key, function (err, relation) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                if (!relation) {
                    resolve({});
                    return;
                }
                relation = JSON.parse(relation);
                resolve(relation);
                return;
            })
        })
    }

    async put(abstractRelation) {
        let {subject, object, relation} = extractStructure(abstractRelation);
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${subject}`;
        let relations = await this._fetchAll(subject);
        relations[object] = relation;
        return await new Promise((resolve, reject) => {
            memcache.set(key, JSON.stringify(relations), 0, function (err) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    }

    async has(subject, object) {
        const key = `${this._connParam.prefix}${subject}`;
        let relations = await this._fetchAll(subject);
        return relations[object];
    }

    async remove(subject, object) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${subject}`;
        let relations = await this._fetchAll(subject);
        if (relations[object]) {
            delete relations[object];
            return await new Promise((resolve, reject) => {
                memcache.set(key, JSON.stringify(relations), 0, function (err) {
                    memcache.end();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                })
            });
        }
    }

    async removeAll(subject) {
        const memcache = new Memcache(`${this._connParam.host}:${this._connParam.port}`, this._config);
        const key = `${this._connParam.prefix}${subject}`;
        return await new Promise((resolve, reject) => {
            memcache.del(key, function (err, relation) {
                memcache.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        })
    }

    async count(subject) {
        let relations = await this._fetchAll(subject);
        relations = [... Object.keys(relations)];
        return relations.length;
    }

    async list(subject, property, order, offset=undefined, number=undefined) {
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