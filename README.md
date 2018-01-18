# qtk-orm-framework

qtk-orm-framework is an orm database framework, support mysql and memcache. This framework aim at providing a single and simple api to deal with k-v type data in both cache and relationship databases. Developer what need to do is just write a data structure schema, and router (means the configuration of database server), and then the framework will help you to build mysql table, and simplify your code.

## Installation

    # in your project
    npm install @qtk/orm-framework --save
    # install global
    npm install @qtk/orm-framework -g

## Description

- Object: a single structure data, k → v data, like userId → userInfo
- Relation: a relationship description of Object with other Object, more information see _**example demo**_

## Usage

---

## Schema Definition

- Keyword
  - **skey** : type for key
  - **ikey** : type for key
  - **string** : type for value
  - **boolean** : type for value
  - **integer** : type for value
  - **object** : type for value
  - **array** : type for value

    // see example/schema/object/user.js
    module.exports = object({
     id: skey(32),
     name: string('default name'),
     level: integer(1),
     score: integer(0),// string, integer, boolean can assign default value
     avatar: string('default_avatar_resource_id'), 
     gender: integer(1),
     lastLoc: object({
     longitude: string(''),
     latitude: string('')
     }),
     isVip: boolean(false),
    });

    // see example/schema/relation/user/friend.js
    module.exports = object({
     subject: skey(32),
     object: skey(32),
     createdTime: string()
    });

    // see example/schema/relation/user/battle_record.js
    // what relation keeping depends on youself
    module.exports = object({
     subject: skey(32),
     object: skey(32),
     competitor: string(32),
     isWin: boolean(),
     myScore: integer(),
     competitorScore: integer(),
     questions: array(string(32)),
     createdTime: ikey()
    });

## Router Definition

Router file has two type, currently and deprecated. current definition describe the new storage server, while the deprecated show the old server. when deprecated one is exist, the framework to will get from the new at first, if get nothing, then will check for the old server, and, copy to the new one. They lie in the same folder, such as 

    user.deprecated.js
    user.js

    // see example/router/object/user.deprecated.js
    module.exports = {
     persistence: {
     shards: [
     {
     media: "mysql",
     host: "localhost",
     port: 3306,
     user: "root",
     password: "",
     database: "db_test_game",
     table: "o_user",
     }
     ],
     hash: function (id) {
     return this.shards[0];
     }
     },
     cache: {
     shards: [
     {
     media: "memcache",
     host: "localhost",
     port: 50035,
     prefix: 'o_user_',
     timeout: 100
     }
     ],
     hash: function (id) {
     return this.shards[0];
     }
     }
    };

## API

---

## Object

- has(id)
- get(id)
- set(object)
- del(id)

## Relation

- fetch(subject, object)
- has(subject, object)
- put(relation)
- remove(subject, object)
- removeAll(subject)
- count(subject)
- list(subject, propertyName, order, offset=undefined, number=undefined)

more usage see demo and src/lib/router/relation.js and src/lib/router/kv.js

## Bin

---

build sql table use below script: specify router path, schema path, type (means object or relation), module (means schema name)

 **orm_build_mysql -r ../../example/router -s ../../example/schema relation user.friend** 

list module: 

 **orm_list_module -r ../../example/router -s ../../example/schema relation **