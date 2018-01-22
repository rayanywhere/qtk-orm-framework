const assert = require('assert');
const ORM = require('../');
ORM.setup(`${__dirname}/../example`);
const ObjectUser = new ORM.Object('user');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.message');

const {Users, Messages, UserMessages} = require('./data');

describe('#basic', function () {
    before( async function() {
        await Promise.all([ObjectUser.set(Users[0]), ObjectUser.set(Users[1]), ObjectUser.set(Users[2])]);
        await Promise.all([ObjectMessage.set(Messages[0]), ObjectMessage.set(Messages[1])]);
        await RelationUserMessage.put(UserMessages[0]);
        await RelationUserMessage.put(UserMessages[1]);
    });

    after(async function() {
        await Promise.all([
            RelationUserMessage.removeAll(Users[0].id),
            RelationUserMessage.removeAll(Users[1].id),
            RelationUserMessage.removeAll(Users[2].id),
            ObjectUser.del(Users[0].id),
            ObjectUser.del(Users[1].id),
            ObjectUser.del(Users[2].id),
            ObjectMessage.del(Messages[0].id),
            ObjectMessage.del(Messages[1].id)
        ])
    });

    it('[object-has]', async function() {
        assert(await ObjectUser.has(Users[0].id) === true, 'user id should exists');
        assert(await ObjectMessage.has(100) === false, 'message id should not exists');
    });

    it('[object-get]', async function() {
        const user = await ObjectUser.get(Users[0].id);
        assert(user !== undefined && user.name === Users[0].name, 'info should match');
    });

    it('[relation-has]', async function() {
        assert(await RelationUserMessage.has(Users[0].id, Messages[0].id) === true, 'should exists');
        assert(await RelationUserMessage.has(Users[1].id, Messages[1].id) === false, 'should not exists');
    });

    it('[relation-fetch]', async function() {
        assert((await RelationUserMessage.fetch(Users[0].id, Messages[0].id)).readTime === 1516538014, 'readTime should match');
    });

    it('[relation-remove', async function() {
        await RelationUserMessage.remove(Users[0].id, Messages[0].id);
    });

    it('[relation-count]', async function() {
        assert(await RelationUserMessage.count(Users[0].id) === 1, 'count should be 1');
    });

    it('[relation-list]', async function() {
        assert((await RelationUserMessage.list(Users[0].id, 'readTime', ORM.Relation.Order.ASC)).length === 1, 'length should be 1');
    })
});