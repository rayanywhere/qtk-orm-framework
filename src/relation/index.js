const assert = require('assert');
const Mutex = require('key_mutex');
const Schema = require('../lib/schema');
const Router = require('../lib/router');
const config = require('../config');


module.exports = class R {
    static get Order() {
        return {ASC: 0, DESC: 1};
    }
    
    constructor(name) {
        this._schema = new Schema(name, `${config.path.relation}/schema`);
        this._router = new Router(name, `${config.path.relation}/router`);
        this._mutex = Mutex.mutex();
    }

    async _load(subject) {
        const relations = await this._router.get(subject);
        if (relations === undefined) {
            return [];
        }
        assert(Array.isArray(relations), `expect data to be an array of subject ${subject} ${relations}`);
        return relations;
    }

    async _save(subject, relations) {
        await this._router.set(subject, relations);
    }

    async fetch(subject, object) {
        const relations = await this._load(subject);
        const position = relations.findIndex(_ => _.object === object);
        if (position < 0) {
            return undefined;
        }
        let relation = Object.assign({subject}, relations[position]);
        this._schema.normalize(relation);
        return relation;
    }

    async put(relation) {
        this._schema.verify(relation);

        const subject = relation.subject;
        relation = Object.assign({}, relation);
        delete relation.subject;

        await this._mutex.lock(subject, async() => {
            let relations = await this._load(subject);
            const position = relations.findIndex(_ => _.object === relation.object);
            if (position < 0) {
                relations.push(relation);
            }
            else {
                relations[position] = relation;
            }
            await this._save(subject, relations);
        });
    }

    async has(subject, object) {
        return (await this.fetch(subject, object) !== undefined);
    }

    async remove(subject, object) {
        await this._mutex.lock(subject, async() => {
            let relations = await this._load(subject);
            const position = relations.findIndex(_ => _.object === object);
            if (position >= 0) {
                relations.splice(position, 1);
                await this._save(subject, relations);
            }
        });       
    }

    async removeAll(subject) {
        return await this._save(subject,[]);
    }

    async count(subject) {
        let relations = await this._load(subject);
        return relations.length;
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        let relations = await this._load(subject);

        relations.sort((lhs, rhs) => {
            return (order === R.Order.ASC) ? lhs[property] - rhs[property] : rhs[property] - lhs[property];
        });

        if (offset !== undefined) {
            relations.splice(0, offset);
        }
        if (number !== undefined) {
            relations.splice(number);
        }

        relations = relations.map(_ => Object.assign({subject}, _));
        relations.forEach(_ => {this._schema.normalize(_)});
        return relations;
    }
}