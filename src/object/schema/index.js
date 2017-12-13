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
        this._schema = eval(`(${doc})`);
    }

    validate(object) {
        (function exec(schema, object) {
            for(let [key,val] of Object.entries(object)) {
                const validator = schema[key];
                if (validator === undefined) {
                    throw new Error(`unexpected key(${key})`);
                }
                if (typeof validator === 'object') {
                    if (typeof val !== 'object') {
                        throw new Error(`schema mismatch`);
                    }
                    exec(validator, val);
                }
                else if (typeof validator === 'function') {
                    validator(val);
                }
                else {
                    throw new Error(`bad validator for key ${key}`);
                }
            }
        })(this._schema, object);
    }
}