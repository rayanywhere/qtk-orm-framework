const ObjectClass = require('./src/object');
const RelationClass = require('./src/object');

module.exports = {
    config: (opts) => {
		Object.assign(require('./config'), opts);
	},
    Object: (name) => {
        return new ObjectClass(name);
    },
    Relation: (name) => {
        return new RelationClass(name);
    }
}