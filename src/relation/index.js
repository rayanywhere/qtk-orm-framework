const Schema = require('./schema');
const Router = require('./router');

module.exports = class {
    constructor(name, schemaPath, routerPath) {
        this._schema = Schema.get(name, schemaPath);
        this._router = new Router(name, routerPath);
    }

    async fetch(subject, object) {
        return await this._router.fetch(subject, object);
    }

    async put(relation) {
        relation = Object.assign({}, relation);
        this._schema.validate(relation);
        await this._router.put(relation);
    }

    async has(subject, object) {
        return await this._router.has(subject, object);
    }

    async remove(subject, object) {
        return await this._router.remove(subject, object);
    }

    async removeAll(subject) {
        return await this._router.removeAll(subject);
    }

    async count(subject) {
        return await this._router.count(subject);
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        return await this._router.list(subject, property, order, offset, number);
    }
}