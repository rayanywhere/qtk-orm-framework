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
        if (this._hasDeprecated)
            this._dRouter = new Router(this._deprecatedRouterPath);
    }

    async has(id) {
        if (await this._cRouter.has(id))
            return true;
        if (this._hasDeprecated && await this._dRouter.has(id)) {
            await this._cRouter.set(await this._dRouter.get(id));
            return true;
        }
        return false;
    }

    async get(id) {
        let object = undefined;
        object = await this._cRouter.get(id);
        if (object === undefined && this._hasDeprecated) {
            object = await this._dRouter.get(id);
            if (object !== undefined) {
                await this._cRouter.set(object);
            }
        }
        return object;
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
