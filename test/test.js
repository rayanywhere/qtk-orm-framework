const assert = require('assert');
const ORM = require('../');
ORM.config({path: `${__dirname}/../example`});

const USER_ID = '00000000000000000000000000000001';
const ARTICLE_ID = '10000000000000000000000000000001';
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
                hobbies: ['driving', 'coding']
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
            await ORM.Relation('user.article').fetch(USER_ID, ARTICLE_ID);
            assert(await ORM.Relation('user.article').has(USER_ID, ARTICLE_ID) == true, `user.article should exist`);
            assert(await ORM.Relation('user.article').count(USER_ID) === 1, 'count of user.article should equal to 1');
            assert((await ORM.Relation('user.article').list(USER_ID)).length === 1, 'length of user.article list should equal to 1');
            //await ORM.Relation('user.article').remove(USER_ID, ARTICLE_ID);
        });
    });
});