module.exports = object({
    subject: string(/^.{32}$/),
    object: string(/^.{32}$/),
    createdTime: integer()
});