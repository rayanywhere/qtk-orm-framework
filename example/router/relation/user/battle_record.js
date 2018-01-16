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
                table: "r_user_battle_record"
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
                port: 50034,
                prefix: 'r_user_battle_record_',
                timeout: 100
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    },
    queue: {
        shards: [
            {
                host: "localhost",
                port: 50034,
                key: 'queue_r_user_battle_record_0'
            },
            {
                host: "localhost",
                port: 50034,
                key: 'queue_r_user_battle_record_1'
            }
        ],
        hash: function (id) {
            return this.shards[ parseInt(id.substr(-2,2), 16) % 2 ];
        }
    },

};