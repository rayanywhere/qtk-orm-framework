const {integer, boolean, string, object, array} = require('../../../').Type;

module.exports = object({
    id: integer(),
    title: string('no title'),
    content: string('no content'),
    sendTime: integer(0)
});