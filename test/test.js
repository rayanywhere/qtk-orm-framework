var assert = require('assert');
const ORM = require('../');
ORM.config({path: `${__dirname}/../example`});

const USER_ID = '00000000000000000000000000000000';

describe('ORM', function() {
    describe('Object', function() {
        it('should return null when trying to get a non-exist object', async function() {
            let user = await ORM.Object('user').get(USER_ID);
            console.log(user);
        });
        it('should execute without error', async function() {
            await ORM.Object('user').set({
                id:USER_ID,
                name:"ray",
                age: 12,
                isVip:true
            });
        });
        it('should execute without error', async function() {
            await ORM.Object('user').del(USER_ID);
        });
    });
    describe('Relation', function() {

    });    
});