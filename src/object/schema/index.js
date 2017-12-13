const fs = require('fs');
const cache = new Map();
const config = require('../../../config');
const validator = require('../../lib/validator');

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
        doc = doc.replace(/:\s*(string|boolean|integer)\((.*?)\)/g, ':validator.$1($2)');
        this._schema = eval(doc);
    }

    validate(object) {
        (function exec(schema, object) {
            for(let [key,validator] of Object.entries(schema)) {
                if (object[key] === undefined) {
                    throw new Error(`missing key(${key}) in object instance`);
                }
                if (typeof validator === 'object') {
                    if (typeof object[key] !== 'object') {
                        throw new Error(`schema mismatch`);
                    }
                    exec(validator, val);
                }
                else if (typeof validator === 'function') {
                    validator(object[key]);
                }
                else {
                    throw new Error(`bad validator for key ${key}`);
                }
            }
        })(this._schema, object);
    }
}