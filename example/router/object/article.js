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
                table: "o_article"
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
                prefix: 'article_',
                timeout: 100
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};