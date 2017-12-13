module.exports = {
    id: string(/^.{32}$/),
    name: string(),
    age: integer([1,2,3]),//{min:0, max:100}),
    isVip: array(integer([1,2,3]))
};