const assert = require('assert');
const KV = require('./kv');

function extractStructure(relation) {
    let subject = relation.subject;
    let object = relation.object;
    delete relation.subject;
    delete relation.object;
    return {subject, object, relation}
}

module.exports = class extends KV {

    constructor(routerPath) {
        super(routerPath);
    }

    async fetch(subject, object) {
        let relations = await this.getKey(subject);
        if (relations && relations[object]) {
            let relation = relations[object];
            relation.subject = subject;
            relation.object = object;
            return relation;
        }
        return undefined;
    }

    async put(relationItem) {
        let {subject, object, relation} = extractStructure(relationItem);
        let relations = await this.getKey(subject);
        if (relations == undefined) {
            relations = {};
        }
        relations[object] = relation;
        await this.setKey(subject, relations);
    }

    async has(subject, object) {
        return (await this.fetch(subject, object) !== undefined);
    }

    async remove(subject, object) {
        let relations = await this.getKey(subject);
        if (relations !== undefined && relations[object]) {
            delete relations[object];
            await this.setKey(subject, relations);
        }
    }

    async removeAll(subject) {
        await this.del(subject);
    }

    async count(subject) {
        let relations = await this.getKey(subject);
        return relations ? [...Object.keys(relations)].length : 0;
    }

    async list(subject, property, order, offset=undefined, number=undefined) {
        let relations = await this.getKey(subject);
        if (relations) {
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
        } else {
            return [];
        }
    }
};
