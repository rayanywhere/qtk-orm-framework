const assert = require('assert');
const Mysql = require('mysql');
const mysqlPool = require('../src/lib/mysql_pool');
const childProcess = require('child_process');

const schemaDir = `${__dirname}/../example/schema`;
const routerDir = `${__dirname}/../example/router`;
const oldRouterDir = `${__dirname}/../example/old_router`;

const ORM = require('../')(schemaDir, routerDir);
const ORMOld = require('../')(schemaDir, oldRouterDir);


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
            await truncate('object', 'article', oldRouterDir);
            await truncate('object', 'article', routerDir);
            for(let id = 1; id <= articleCount; id++) {
                await ORMOld.Object('article').set({id, title: `title ${id}`, content: `content ${id}`});
            }
            // migration
            await exec(`${__dirname}/../bin/object_list_id.js article -r ${oldRouterDir} | ${__dirname}/../bin/migrate.js object article -s ${schemaDir} -r ${routerDir} -o ${oldRouterDir}`);
            // validate
            for(let id = 1; id <= articleCount; id++) {
                assert((await ORM.Object('article').get(id)) != null, `expect article ${id} to be non-null in new db, got null.`);
            }
            // clear
            await truncate('object', 'article', oldRouterDir);
            await truncate('object', 'article', routerDir);
        });
        it('migrate relation - should return without error', async function() {
            this.timeout(10000);
            // prepare data
            await truncate('relation', 'user.article', oldRouterDir);
            await truncate('relation', 'user.article', routerDir);
            for(let aid = 1; aid <= articleCount; aid++) {
                await ORMOld.Relation('user.article').put({
                    subject: `0000000000000000000000000000000${aid % 3 + 1}`,
                    object: aid,
                    createdTime: parseInt(new Date().getTime() / 1000)
                });
            }
            // migration
            await exec(`${__dirname}/../bin/relation_list_subject.js user.article -r ${oldRouterDir} | ${__dirname}/../bin/migrate/index.js relation user.article -s ${schemaDir} -r ${routerDir} -o ${oldRouterDir}`);
            // validate
            let countUser1 = await ORM.Relation('user.article').count('00000000000000000000000000000001');
            let countUser2 = await ORM.Relation('user.article').count('00000000000000000000000000000002');
            let countUser3 = await ORM.Relation('user.article').count('00000000000000000000000000000003');
            assert(countUser1 + countUser2 + countUser3 === articleCount, `expect count of all relations to be ${articleCount}.`);
            // clear
            await truncate('relation', 'user.article', oldRouterDir);
            await truncate('relation', 'user.article', routerDir);
        });
    });
});

async function truncate(mod, modelName, routerPath) {
    const oldRouter = require([routerPath, mod, ...modelName.split('.')].join('/'));
    for(let shard of oldRouter.shards) {
        let mysql = await mysqlPool.fetch(shard);
        const sql = Mysql.format('truncate table ??.??', [shard.database, shard.table]);
        await new Promise((resolve, reject) => {
            mysql.query(sql, (error, rows, fields) => {
                mysql.release();
                error ? reject(error) : resolve();
            });
        });
    }
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