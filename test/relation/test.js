const assert = require('assert');

const schemaDir = `${__dirname}/../../example/schema`;
const routerDir = `${__dirname}/../../example/router`;
const ORM = require('../../')(schemaDir, routerDir);

const USERID = '00000000000000000000000000000001';
const USER_INFO = {
    id: USERID,
    name: 'Yui',
    level: 10,
    score: 350,
    avatar: 'Yui`s avatar uri',
    gender: 0,
    lastLoc: {
        longitude: '113.46',
        latitude: '22.27'
    },
    isVip: false
};

describe('#user_not_exist', function () {
    //has get set del
    it('[has]', async function () {
        let exist = await ORM.Object('user').has(USERID);
        assert(exist == false, `should not exist`);
    });

    it('[get]', async function () {
        let user = await ORM.Object('user').get(USERID);
        assert(user == undefined, `should get undefined`);
    });

    it('[del]', async function () {
        await ORM.Object('user').del(USERID);
    });

    it('[set]', async function () {
        await ORM.Object('user').set(USER_INFO);
    });
});

describe('#user_exist', function () {
    //has get set del
    before( async function() {
        await ORM.Object('user').set(USER_INFO);
    });

    it('[has]', async function () {
        let exist = await ORM.Object('user').has(USERID);
        assert(exist == true, `should exist`);
    });

    it('[get]', async function () {
        let user = await ORM.Object('user').get(USERID);
        assert(user.id = USERID, `should get user yui`);
    });

    it('[del]', async function () {
        await ORM.Object('user').del(USERID);
    });

    it('[set]', async function () {
        await ORM.Object('user').set(USER_INFO);
    });
});