const Schema = require('./schema');
const Router = require('./router');

module.exports = class {
    constructor(name, schemaPath, routerPath) {
        this._schema = Schema.get(name, schemaPath);
        this._router = new Router(name, routerPath);
    }

    async has(id) {
        return await this._router.has(id);
    }

    async get(id) {
        let object = await this._router.get(id);
        if (object !== undefined) {
            this._schema.validate(object);
        }
        return object;
    }

    async set(object) {
        object = Object.assign({}, object);
        this._schema.validate(object);
        await this._router.set(object);
    }

    async del(id) {
        await this._router.del(id)
    }
}