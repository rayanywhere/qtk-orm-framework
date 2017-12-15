module.exports = {
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
};