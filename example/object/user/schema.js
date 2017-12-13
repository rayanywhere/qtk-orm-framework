module.exports = object({
    id: string(/^.{32}$/),
    name: string(),
    age: integer({min:0, max:100}),
    isVip: boolean(),
    hobbies: array(string())
});