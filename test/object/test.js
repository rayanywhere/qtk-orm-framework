const assert = require('assert');

const schemaDir = `${__dirname}/../../example/schema`;
const routerDir = `${__dirname}/../../example/router`;
const ORM = require('../../')(schemaDir, routerDir);

const USERID = '00000000000000000000000000000001';

describe('#object', function () {

    //has get set del

    it('[has] user not exist', async function () {
        let result = await ORM.Object('user').has(USERID);
        console.log(`result: ${result}`);
        console.log('233333333333');
    })

});