const fs = require('fs');
const Router = require('../../lib/router/relation');

const deprecatedCheckMap = new Map();

module.exports = class {

    constructor(name, routerPath) {
        this._currentRouterPath = `${routerPath}/relation/${name.replace(/\./g, '/')}.js`;
        this._deprecatedRouterPath = `${routerPath}/relation/${name.replace(/\./g, '/')}.deprecated.js`;
        if (!deprecatedCheckMap.has(this._deprecatedRouterPath)) {
            deprecatedCheckMap.set(this._deprecatedRouterPath, fs.existsSync(this._deprecatedRouterPath));
        }
        this._hasDeprecated = deprecatedCheckMap.get(this._deprecatedRouterPath);
        this._cRouter = new Router(this._currentRouterPath);
        if (this._hasDeprecated)
            this._dRouter = new Router(this._deprecatedRouterPath);
    }

    async _asyncDeprecatedToCurrent(subject) {
        if ((this._hasDeprecated) && (!await this.cRouter.isKeyExist(subject)) && (!await this.dRouter.isKeyExist(subject))) {
            await this._cRouter.setRaw(subject, await this._dRouter.getRaw(subject));
        }
    }

    async fetch(subject, object) {
        await this._asyncDeprecatedToCurrent(subject);
        if (await this._cRouter.has(subject, object)) {
            return true;
        }
        return false;
    }

    async put(relation) {
        await this._asyncDeprecatedToCurrent(relation.subject);
        await this._cRouter.put(relation);
    }

    async has(subject, object) {
        await this._asyncDeprecatedToCurrent(subject);
        if (await this._cRouter.has(subject, object))
            return true;
        return false;
    }

    async remove(subject, object) {
        await this._cRouter.remove(subject, object);
        if (this._hasDeprecated) {
            await this.dRouter.remove(subject, object);
        }
    }

    async removeAll(subject) {
        await this._cRouter.removeAll(subject);
        if (this._hasDeprecated) {
            await this.dRouter.removeAll(subject);
        }
    }

    async count(subject) {
        await this._asyncDeprecatedToCurrent(subject);
        return await this._cRouter.count(subject);
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        await this._asyncDeprecatedToCurrent(subject);
        return await this._cRouter.list(subject, property, order, offset, number);
    }
}
