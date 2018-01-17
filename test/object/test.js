const assert = require('assert');

const schemaDir = `${__dirname}/../../example/schema`;
const routerDir = `${__dirname}/../../example/router`;
const ORM = require('../../')(schemaDir, routerDir);

const Uses = require('../data').user;

describe('#object_not_exist', function () {
    //has get set del
    before( async function() {
        await ORM.Object('user').del(Uses.Yui.id);
    });

    after(async function() {
        await ORM.Object('user').del(Uses.Yui.id);
    });

    it('[has]', async function () {
        let exist = await ORM.Object('user').has(Uses.Yui.id);
        assert(exist == false, `should not exist`);
    });

    it('[get]', async function () {
        let user = await ORM.Object('user').get(Uses.Yui.id);
        assert(user == undefined, `should get undefined`);
    });

    it('[del]', async function () {
        await ORM.Object('user').del(Uses.Yui.id);
    });

    it('[set]', async function () {
        await ORM.Object('user').set(Uses.Yui);
    });
});

describe('#object_exist', function () {
    //has get set del
    before( async function() {
        await ORM.Object('user').set(Uses.Yui);
    });

    after(async function() {
        await ORM.Object('user').del(Uses.Yui.id);
        await ORM.Object('user').del(Uses.Ken.id);
    });

    it('[has]', async function () {
        let exist = await ORM.Object('user').has(Uses.Yui.id);
        assert(exist == true, `should exist`);
    });

    it('[get]', async function () {
        let user = await ORM.Object('user').get(Uses.Yui.id);
        assert(user.id = Uses.Yui.id, `should get user yui`);
    });

    it('[del]', async function () {
        await ORM.Object('user').del(Uses.Yui.id);
    });

    it('[set]', async function () {
        await ORM.Object('user').set(Uses.Yui);
    });

    it('[set] old structure object, avatar is not exist', async function () {
        await ORM.Object('user').set(Uses.Ken);
        let old = await ORM.Object('user').get(Uses.Ken.id);
        assert(old.avatar, 'old structure avatar should set automatically');
    })
});