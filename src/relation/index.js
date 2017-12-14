const Schema = require('./schema');
const Router = require('./router');

module.exports = class {
    constructor(name) {
        this._schema = Schema.create(name);
        this._router = Router.create(name);
    }

    async fetch(subject, object) {
        const storage = this._router.find(subject);
        const relation = await storage.fetch(subject, object);
        this._schema.validate(relation);        
        return relation;
    }

    async put(relation) {
        this._schema.validate(relation);
        const storage = this._router.find(relation.subject);
        await storage.put(relation);
    }

    async has(subject, object) {
        const storage = this._router.find(subject);
        return await storage.has(subject, object);
    }

    async remove(subject, object) {
        const storage = this._router.find(subject);
        await storage.remove(subject, object);
    }

    async removeAll(subject) {
        const storage = this._router.find(subject);
        await storage.removeAll(subject);
    }

    async count(subject) {
        const storage = this._router.find(subject);
        return await storage.count(subject);
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        const storage = this._router.find(subject);
        const relations = await storage.list(subject, property, order, offset, number);
        relations.forEach(relation => this._schema.validate(relation));
        return relations;
    }
};