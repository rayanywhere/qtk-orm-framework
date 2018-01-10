module.exports = {
    shards: [
        {
            media: "mysql",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "db_test",
            table: "o_article_0"
        },
        {
            media: "mysql",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "db_test",
            table: "o_article_1"
        }
    ],
    hash: function (id) {
        return this.shards[id % this.shards.length];
    }
};