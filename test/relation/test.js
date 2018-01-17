const assert = require('assert');

const schemaDir = `${__dirname}/../../example/schema`;
const routerDir = `${__dirname}/../../example/router`;
const ORM = require('../../')(schemaDir, routerDir);

const Data = require('../data');

describe('#relation', function () {
    //fetch put has remove removeAll count list
    before( async function() {
        await ORM.Object('user').del(Data.user.Yui.id);
        await ORM.Object('user').del(Data.user.Jessica.id);
        await ORM.Object('user').del(Data.user.Ken.id);
        await ORM.Object('user').set(Data.user.Yui);
        await ORM.Object('user').set(Data.user.Jessica);
        await ORM.Object('user').set(Data.user.Ken);
    });

    after(async function() {
        await ORM.Object('user').del(Data.user.Yui.id);
        await ORM.Object('user').del(Data.user.Jessica.id);
        await ORM.Object('user').del(Data.user.Ken.id);
    });


    // it('[has] not exist', async function () {
    //     let areFriend = await ORM.Relation('user.friend').has(Data.user.Yui.id, Data.user.Jessica.id);
    //     assert(!areFriend, 'they are not friend right now');
    // });

    // it('[fetch] not exist', async function () {
    //     let relation = await ORM.Relation('user.friend').fetch(Data.user.Yui.id, Data.user.Jessica.id);
    //     assert(relation == undefined, 'they are not friend right now');
    // });








});
