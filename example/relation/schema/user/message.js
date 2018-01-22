const {integer, boolean, string, object} = require('../../../../').Type;

module.exports = object({
    subject: string(),
    object: integer(),
    readTime: integer(0)
});