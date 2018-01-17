const KV = require('./kv');

function extractStructure(object) {
    let id = object.id;
    delete object.id;
    return {id, object}
}

module.exports = class extends KV {

    constructor(routerPath) {
        super(routerPath);
    }

    async has(id) {
        return await this.hasKey(id);
    }

    async get(id) {
        let object =  await this.getKey(id);
        if (object) object.id = id;
        return object;
    }

    async set(objectItem) {
        let {id, object} = extractStructure(objectItem);
        await this.setKey(id, object);
    }

    async del(id) {
        await this.delKey(id);
    }

};