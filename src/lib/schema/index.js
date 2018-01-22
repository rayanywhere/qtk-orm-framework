const Mode = require('../type').Mode;

module.exports = class {
    constructor(name, schemaPath) {
        this._schema = require(`${schemaPath}/${name.replace(/\./g, '/')}.js`);
    }

    normalize(obj) {
        const wrapper = {obj};
        this._schema({node:wrapper, name:"obj"}, Mode.NORMALIZE);
    }

    verify(obj) {
        const wrapper = {obj};
        this._schema({node:wrapper, name:"obj"}, Mode.VERIFY);
    }
}