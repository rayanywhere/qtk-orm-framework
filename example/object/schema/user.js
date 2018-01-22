const {integer, boolean, string, object, array} = require('../../../').Type;

module.exports = object({
    id: string(),
    name: string('default name'),
    gender: integer(1),
    location: object({
        lng: string(''),
        lat: string('')
    }),
    isVip: boolean(false),
    friends: array(object({
        fid: string(''),
        time: integer(0)
    }))
});