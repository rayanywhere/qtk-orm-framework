const assert = require('assert');
const ORM = require('../');
ORM.config({path: `${__dirname}/../example`});

const USER_ID = '00000000000000000000000000000001';
const ARTICLE_ID = '10000000000000000000000000000001';
const ARTICLE_ID2 = '10000000000000000000000000000002';

describe('ORM', function() {
    describe('Object', function() {
        it('should return without error', async function() {
            await ORM.Object('user').del(USER_ID);
            assert(await ORM.Object('user').has(USER_ID) === false, `user should not exist by now`);
            await ORM.Object('user').get(USER_ID).then(() => {
                throw new Error(`get() should not be successful by now`);
            }).catch(err => {});
            await ORM.Object('user').set({
                id:USER_ID,
                name:"ray",
                age: 12,
                isVip:true,
                hobbies: ['driving', '敏感词', '不可描述']
            });
            assert(await ORM.Object('user').has(USER_ID), `user should exist by now`);
            await ORM.Object('user').get(USER_ID);
            await ORM.Object('user').del(USER_ID);
        });
    });
    describe('Relation', function() {
        it('should return without error', async function() {
            await ORM.Relation('user.article').removeAll(USER_ID);
            await ORM.Relation('user.article').put({
                subject: USER_ID,
                object: ARTICLE_ID,
                createdTime: parseInt(new Date().getTime() / 1000)
            });
            await ORM.Relation('user.article').put({
                subject: USER_ID,
                object: ARTICLE_ID2,
                createdTime: parseInt(new Date().getTime() / 1000 + 1)
            });
            await ORM.Relation('user.article').fetch(USER_ID, ARTICLE_ID);
            assert(await ORM.Relation('user.article').has(USER_ID, ARTICLE_ID) === true, `user.article should exist`);
            assert(await ORM.Relation('user.article').count(USER_ID) === 2, 'count of user.article should equal to 2');

            assert(await (async () => {
                let articleList = await ORM.Relation('user.article').list(USER_ID, 'createdTime', 'asc');
                assert(articleList.length === 2, 'length of user.article list should equal to 2');
                return articleList[0].createdTime < articleList[1].createdTime;
            })() === true, 'list should order by createdTime ascend');

            assert(await (async () => {
                let articleList = await ORM.Relation('user.article').list(USER_ID, 'createdTime', 'desc');
                assert(articleList.length === 2, 'length of user.article list should equal to 2');
                return articleList[0].createdTime > articleList[1].createdTime;
            })() === true, 'list should order by createdTime descend');

            await ORM.Relation('user.article').remove(USER_ID, ARTICLE_ID);
            assert(await ORM.Relation('user.article').has(USER_ID, ARTICLE_ID) === false, `user.article should not exist`);
            assert(await ORM.Relation('user.article').count(USER_ID) === 1, 'count of user.article should equal to 1');
            await ORM.Relation('user.article').removeAll(USER_ID);
        });
    });
});