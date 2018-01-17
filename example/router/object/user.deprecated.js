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
                tag: 'deprecated'
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
                prefix: 'o_user_',
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
                key: 'queue_o_user_0'
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    },

};