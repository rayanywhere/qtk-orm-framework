module.exports = object({
    id: skey(32),
    name: string(),
    age: integer(),
    isVip: boolean(),
    hobbies: array(string()),
    location: object({
        longitude: string(),
        latitude: string()
    })
});