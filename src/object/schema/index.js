const fs = require('fs');
const cache = new Map();
const config = require('../../../config');
const {integer, string, boolean, object, array} = require('../../lib/validator');

module.exports = class {
    static create(name) {
        if (cache.has(name)) {
            return cache.get(name);
        }

        const schema = new this(name);
        cache.set(name, schema);
        return schema;
    }

    constructor(name) {
        let doc = fs.readFileSync(`${config.path}/object/${name.replace(/\./g, '/')}/schema.js`, {encoding:'utf8'});
        this._validate = eval(doc);
    }

    validate(obj) {
        this._validate(obj);
    }
}