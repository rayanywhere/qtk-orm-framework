const fs = require('fs');
const cache = new Map();
const {skey, ikey, integer, string, boolean, object, array} = require('../../lib/validator');

module.exports = class {
    static get(name, schemaPath) {
        const fileName = `${schemaPath}/object/${name.replace(/\./g, '/')}.js`;
        if (cache.has(fileName)) {
            return cache.get(fileName);
        }
        const schema = new this(fileName);
        cache.set(fileName, schema);
        return schema;
    }

    constructor(fileName) {
        const doc = fs.readFileSync(fileName, {encoding: 'utf8'});
        this._validate = eval(doc);
    }

    validate(obj) {
        this._validate(obj);
    }
}