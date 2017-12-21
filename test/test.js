const assert = require('assert');
const Mysql = require('mysql');
const mysqlPool = require('../src/lib/mysql_pool');
const childProcess = require('child_process');

const schemaDir = `${__dirname}/../example/schema`;
const oldSchemaDir = `${__dirname}/../example/old_schema`;
const routerDir = `${__dirname}/../example/router`;
const oldRouterDir = `${__dirname}/../example/old_router`;

const ORM = require('../')(schemaDir, routerDir);
const ORMOldRouter = require('../')(schemaDir, oldRouterDir);
const ORMOldSchema = require('../')(oldSchemaDir, routerDir);


const USER_ID = '00000000000000000000000000000001';
const ARTICLE_ID = 1;
const ARTICLE_ID2 = 2;
const articleCount = 1086;

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
                createdTime: parseInt(new Date().getTime() / 1000),
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
                let articleList = await ORM.Relation('user.article').list(USER_ID, 'object', 'asc');
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

    describe('Migrate', function(){
        it('migrate object - should return without error', async function() {
            this.timeout(10000);
            // prepare data
            await clear('object', 'article', oldRouterDir, schemaDir);
            await clear('object', 'article', routerDir, schemaDir);
            for(let id = 1; id <= articleCount; id++) {
                await ORMOldRouter.Object('article').set({id, title: `title ${id}`, content: `content ${id}`});
            }
            // migration
            await migrate('object', 'article', schemaDir, routerDir, oldRouterDir);
            // validate
            for(let id = 1; id <= articleCount; id++) {
                assert((await ORM.Object('article').get(id)) != null, `expect article ${id} to be non-null in new db, got null.`);
            }
            // clear
            await clear('object', 'article', oldRouterDir, schemaDir);
            await clear('object', 'article', routerDir, schemaDir);
        });
        it('migrate relation - should return without error', async function() {
            this.timeout(10000);
            // prepare data
            await clear('relation', 'user.article', oldRouterDir, schemaDir);
            await clear('relation', 'user.article', routerDir, schemaDir);
            for(let aid = 1; aid <= articleCount; aid++) {
                await ORMOldRouter.Relation('user.article').put({
                    subject: `0000000000000000000000000000000${aid % 3 + 1}`,
                    object: aid,
                    createdTime: parseInt(new Date().getTime() / 1000)
                });
            }
            // migration
            await migrate('relation', 'user.article', schemaDir, routerDir, oldRouterDir);
            // validate
            let countUser1 = await ORM.Relation('user.article').count('00000000000000000000000000000001');
            let countUser2 = await ORM.Relation('user.article').count('00000000000000000000000000000002');
            let countUser3 = await ORM.Relation('user.article').count('00000000000000000000000000000003');
            let actualCount = countUser1 + countUser2 + countUser3;
            assert(actualCount === articleCount, `expect actualCount to be ${articleCount}, got: ${actualCount}`);
            // clear
            await clear('relation', 'user.article', oldRouterDir, schemaDir);
            await clear('relation', 'user.article', routerDir, schemaDir);
        });
    });

    describe('Reshape', function() {
        it('reshape object - should return without error', async function() {
            this.timeout(10000);
            // prepare data
            await clear('object', 'article', routerDir, oldSchemaDir);
            for(let id = 1; id <= articleCount; id++) {
                await ORMOldSchema.Object('article').set({
                    id, title: `title ${id}`, 
                    content: `content ${id}`, 
                    createdTime: parseInt(new Date().getTime()/1000)
                });
            }
            // migration
            await reshape('object', 'article', `${__dirname}/reshape/article.js`, schemaDir, oldSchemaDir, routerDir);
            // claar
            await clear('object', 'article', routerDir, schemaDir);
        });
        it('reshape relation - should return without error', async function() {
            this.timeout(10000);
            // prepare data
            await clear('relation', 'user.article', routerDir, oldSchemaDir);
            for(let aid = 1; aid <= articleCount; aid++) {
                await ORMOldSchema.Relation('user.article').put({
                    subject: `0000000000000000000000000000000${aid % 3 + 1}`,
                    object: aid,
                    createdTime: parseInt(new Date().getTime() / 1000),
                    modifiedTime: parseInt(new Date().getTime() / 1000)
                });
            }
            // migration
            await reshape('relation', 'user.article', `${__dirname}/reshape/user.article.js`, schemaDir, oldSchemaDir, routerDir);
            // claar
            //await clear('relation', 'user.article', routerDir, schemaDir);
        });
    });
});

async function clear(mod, modelName, routerDir, schemaDir) {
    await exec(`${__dirname}/../bin/list.js ${mod} ${modelName} -r ${routerDir} | ${__dirname}/../bin/clear.js ${mod} ${modelName} -r ${routerDir} -s ${schemaDir}`);
}

async function migrate(mod, modelName, schemaDir, routerDir, oldRouterDir) {
    await exec(`${__dirname}/../bin/list.js ${mod} ${modelName} -r ${oldRouterDir} | ${__dirname}/../bin/migrate.js ${mod} ${modelName} -s ${schemaDir} -r ${routerDir} -o ${oldRouterDir}`);
}

async function reshape(mod, modelName, reshapeScriptFile, schemaDir, oldSchemaDir, routerDir) {
    await exec(`${__dirname}/../bin/list.js ${mod} ${modelName} -r ${routerDir} | ${__dirname}/../bin/reshape.js ${mod} ${modelName} ${reshapeScriptFile} -s ${schemaDir} -o ${oldSchemaDir} -r ${routerDir}`);
}

async function exec(cmd) {
    return new Promise((resolve, reject) => {
        childProcess.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error, stderr);
                return;
            }
            resolve(stdout, stderr);
        });
    });
}