const Schema = require('../lib/schema');
const Router = require('../lib/router');
const config = require('../config');

module.exports = class {
    constructor(name) {
        this._schema = new Schema(name, `${config.path.object}/schema`);
        this._router = new Router(name, `${config.path.object}/router`);
    }

    async has(id) {
        return (await this._router.get(id) !== undefined);
    }

    async get(id) {
        let obj = await this._router.get(id);
        if (obj === undefined) {
            return undefined;
        }
        obj = Object.assign({id}, obj);
        this._schema.normalize(obj);
        return obj;
    }

    async set(obj) {
        this._schema.verify(obj);
        const id = obj.id;

        obj = Object.assign({}, obj);
        delete obj.id;

        await this._router.set(id, obj);
    }

    async del(id) {
        await this._router.del(id);
    }
}