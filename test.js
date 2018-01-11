const Schema = require('./src/object/schema');

let schema = Schema.create('user', '/Users/leo/projects/qtk/qtk-orm-framework/example/schema');

let data = {
    id:"00000000000000000000000000000001",
    // name: 'ray',
    age: 12,
    isVip:true,
    hobbies: ['driving', '敏感词', '不可描述'],
    // location: {
    //     // longitude: '110.118',
    //     // latitude: '120.233'
    // }
}
schema.validate(data);
console.log(JSON.stringify(data, null, 4))

