const Schema = require('./schema');
const Router = require('./router');

module.exports = class {
    constructor(name, schemaPath, routerPath) {
        this._schema = Schema.create(name, schemaPath);
        this._router = Router.create(name, routerPath);
    }

    async has(id) {
        const storage = this._router.find(id);
        return storage.has(id);
    }

    async get(id) {
        const storage = this._router.find(id);
        const object = await storage.get(id);
        this._schema.validate(object);        
        return object;
    }

    async set(object) {
        this._schema.validate(object);
        const storage = this._router.find(object.id);
        await storage.set(object);
    }

    async del(id) {
        const storage = this._router.find(id);
        await storage.del(id);
    }
}