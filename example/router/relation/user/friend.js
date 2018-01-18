module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_test_game_new",
                table: "r_user_friend"
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
                prefix: 'r_user_friend_',
                timeout: 100
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }

};