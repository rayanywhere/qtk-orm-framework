module.exports = object({
    id: skey(32),
    name: string('default name'),
    age: integer(123),
    isVip: boolean(true),
    hobbies: array(string()),
    location: object({
        longitude: string('我家'),
        latitude: string('你家')
    })
});