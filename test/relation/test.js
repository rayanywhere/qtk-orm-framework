const assert = require('assert');

const schemaDir = `${__dirname}/../../example/schema`;
const routerDir = `${__dirname}/../../example/router`;
const ORM = require('../../')(schemaDir, routerDir);

const Data = require('../data');

describe('#relation', function () {
    //has fetch put remove removeAll count list
    before( async function() {
        await ORM.Object('user').del(Data.user.Yui.id);
        await ORM.Object('user').del(Data.user.Jessica.id);
        await ORM.Object('user').del(Data.user.Ken.id);
        await ORM.Relation('user.friend').removeAll(Data.user.Yui.id);
        await ORM.Object('user').set(Data.user.Yui);
        await ORM.Object('user').set(Data.user.Jessica);
        await ORM.Object('user').set(Data.user.Ken);
    });

    after(async function() {
        await ORM.Object('user').del(Data.user.Yui.id);
        await ORM.Object('user').del(Data.user.Jessica.id);
        await ORM.Object('user').del(Data.user.Ken.id);
        await ORM.Relation('user.friend').removeAll(Data.user.Yui.id);
    });


    it('[has] not exist', async function () {
        let areFriends = await ORM.Relation('user.friend').has(Data.user.Yui.id, Data.user.Jessica.id);
        assert(!areFriends, 'they are not friends right now');
    });

    it('[fetch] not exist', async function () {
        let relation = await ORM.Relation('user.friend').fetch(Data.user.Yui.id, Data.user.Jessica.id);
        assert(relation == undefined, 'they are not friends right now');
    });

    it('[remove] not exist', async function () {
        await ORM.Relation('user.friend').remove(Data.user.Yui.id, Data.user.Jessica.id);
    });

    it('[removeAll] not exist', async function () {
        await ORM.Relation('user.friend').removeAll(Data.user.Yui.id);
    });

    it('[count] not exist', async function () {
        let count = await ORM.Relation('user.friend').count(Data.user.Yui.id);
        assert(count === 0, 'should get count equal to 0');
    });

    it('[list] not exist', async function () {
        let relations = await ORM.Relation('user.friend').list(Data.user.Yui.id);
        assert(relations.length === 0, 'should get empty array');
    });

    it('[put] Yui make friends with Jessica', async function () {
        await ORM.Relation('user.friend').put({
            subject: Data.user.Yui.id,
            object: Data.user.Jessica.id,
            createdTime: new Date().getTime()
        });
    });

    it('[put] Yui make friends with Ken', async function () {
        await ORM.Relation('user.friend').put({
            subject: Data.user.Yui.id,
            object: Data.user.Ken.id,
            createdTime: new Date().getTime()
        });
    });

    it('[has] Yui had make friends with Jessica', async function () {
        let areFriends = await ORM.Relation('user.friend').has(Data.user.Yui.id, Data.user.Jessica.id);
        assert(areFriends, 'should has friend relation');
    });

    it('[count] Yui has 2 friends', async function () {
        let count = await ORM.Relation('user.friend').count(Data.user.Yui.id);
        assert(count == 2, 'should has 2 friend relation');
    });

    it('[fetch] relation of Yui and Ken', async function () {
        let relation = await ORM.Relation('user.friend').fetch(Data.user.Yui.id, Data.user.Ken.id);
        assert(relation != undefined, 'should has friends relation')
    });

    it('[list] Yui list all friends order by createdTimd desd', async function () {
        let relations = await ORM.Relation('user.friend').list(Data.user.Yui.id, 'createdTime', 'DESC');
        assert(relations[0].object == Data.user.Ken.id, 'ken should be the second friend');
    });

    it('[list] Yui list all friends order by createdTimd asc', async function () {
        let relations = await ORM.Relation('user.friend').list(Data.user.Yui.id, 'createdTime', 'ASC');
        assert(relations[0].object == Data.user.Jessica.id, 'ken should be the first friend');
    });

    it('[remove] Yui hate Jessica', async function () {
        await ORM.Relation('user.friend').remove(Data.user.Yui.id, Data.user.Jessica.id);
        let count = await ORM.Relation('user.friend').count(Data.user.Yui.id);
        assert(count == 1, 'Yui just has one friend now')
    });

    it('[removeAll] Yui hate everyone', async function () {
        await ORM.Relation('user.friend').removeAll(Data.user.Yui.id);
        let count = await ORM.Relation('user.friend').count(Data.user.Yui.id);
        assert(count == 0, 'Yui has no friend now')
    });

});
