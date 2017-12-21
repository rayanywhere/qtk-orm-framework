module.exports = object({
    subject: skey(32),
    object: ikey(),
    createdTime: integer(),
    modifiedTime: integer()
});