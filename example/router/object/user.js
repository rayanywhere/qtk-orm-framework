module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_test",
                table: "o_user"
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
                host: "10.10.5.19",
                port: 50034,
                prefix: 'user_',
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
                key: 'user_queue_0'
            },
            {
                host: "localhost",
                port: 50034,
                key: 'user_queue_1'
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    },

};