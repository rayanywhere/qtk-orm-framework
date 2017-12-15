const ObjectClass = require('./src/object');
const RelationClass = require('./src/relation');

class ORM {
    constructor(schemaPath, routerPath) {
        this._schemaPath = schemaPath;
        this._routerPath = routerPath;
	}
    Object(name) {
        return new ObjectClass(name, this._schemaPath, this._routerPath);
    }
    Relation(name) {
        return new RelationClass(name, this._schemaPath, this._routerPath);
    }
}

module.exports = (schemaPath, routerPath) => new ORM(schemaPath, routerPath);
