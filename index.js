const fs = require('fs');
const path = require('path');
const assert = require('assert');

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

module.exports = (schemaPath, routerPath) => {
    schemaPath = path.resolve(schemaPath);
    routerPath = path.resolve(routerPath);
    assert(fs.lstatSync(schemaPath).isDirectory(), `expect schemaPath to be an directory`);
    assert(fs.lstatSync(routerPath).isDirectory(), `expect routerPath to be an directory`);
    return new ORM(schemaPath, routerPath);
};
