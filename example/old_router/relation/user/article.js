module.exports = {
    shards: [
        {
            media: "mysql",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "db_test",
            table: "r_user_article_0"
        },
        {
            media: "mysql",
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "db_test",
            table: "r_user_article_1"
        }
    ],
    hash: function (id) {
        return this.shards[id % this.shards.length];
    }
};