module.exports = object({
    id: string(/^.{32}$/),
    name: string(),
    age: integer({min:0, max:100}),
    gender: string(['male', 'female']),
    type: integer([1, 2, 3]),
    isVip: boolean(),
    hobbies: array(string()),
});