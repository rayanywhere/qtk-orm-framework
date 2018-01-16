module.exports = object({
    id: skey(32),
    name: string('default name'),
    level: integer(1),
    score: integer(0),
    avatar: string('default_avatar_resource_id'),
    gender: integer(1),
    last_loc: object({
        longitude: string(''),
        latitude: string('')
    }),
    isVip: boolean(false),
});