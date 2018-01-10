const Schema = require('./schema');
const Router = require('./router');

module.exports = class {
    constructor(name, schemaPath, routerPath) {
        this._schema = Schema.create(name, schemaPath);
        this._router = Router.create(name, routerPath);
    }

    async has(id) {
        const storage = this._router.findPersistence(id);
        return storage.has(id);
    }

    async get(id) {
        let object = undefined;
        let cache = undefined;
        if (this._router.hasCache()) {
            cache = this._router.findCache(id);
            object = await cache.get(id).catch(err => undefined);
            if (object !== undefined) {
                this._schema.validate(object);
                return object;
            }
        }
        const storage = this._router.findPersistence(id);
        object = await storage.get(id);
        if (object == null) return undefined;
        this._schema.validate(object);
        if (cache) cache.set(object).catch(err => {});
        return object;
    }

    async set(object) {
        let cache = undefined;
        this._schema.validate(object);
        if (this._router.hasCache()) {
            cache = this._router.findCache(object.id);
            await cache.set(object);
        }
        const storage = this._router.findPersistence(object.id);
        await storage.set(object);
    }

    async del(id) {
        if (this._router.hasCache()) {
            const cache = this._router.findCache(id);
            await cache.del(id);
        }
        const storage = this._router.findPersistence(id);
        await storage.del(id);
    }
}