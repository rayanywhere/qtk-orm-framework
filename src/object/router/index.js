const fs = require('fs');
const Router = require('../../lib/router/object');

const deprecatedCheckMap = new Map();

module.exports = class {

    constructor(name, routerPath) {
        this._currentRouterPath = `${routerPath}/object/${name.replace(/\./g, '/')}.js`;
        this._deprecatedRouterPath = `${routerPath}/object/${name.replace(/\./g, '/')}.deprecated.js`;
        if (!deprecatedCheckMap.has(this._deprecatedRouterPath)) {
            deprecatedCheckMap.set(this._deprecatedRouterPath, fs.existsSync(this._deprecatedRouterPath));
        }
        this._hasDeprecated = deprecatedCheckMap.get(this._deprecatedRouterPath);
        this._cRouter = new Router(this._currentRouterPath);
        if (this._hasDeprecated) {
            this._dRouter = new Router(this._deprecatedRouterPath);
        }
    }

    async _syncDeprecatedToCurrent(id) {
        if ((this._hasDeprecated) && (!await this._cRouter.hasKey(id)) && (await this._dRouter.hasKey(id))) {
            await this._cRouter.setKey(id, await this._dRouter.getKey(id));
        }
    }

    async has(id) {
        await this._syncDeprecatedToCurrent(id);
        if (await this._cRouter.has(id))
            return true;
        return false;
    }

    async get(id) {
        await this._syncDeprecatedToCurrent(id);
        let object = undefined;
        return await this._cRouter.get(id);
    }

    async set(object) {
        await this._cRouter.set(object);
    }

    async del(id) {
        await this._cRouter.del(id);
        if (this._hasDeprecated)
            await this._dRouter.del(id);
    }
}
