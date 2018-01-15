const mysql = require('mysql');
const cache = new Map();

module.exports = class {
    static fetch(connParam) {
        const key = `${connParam.user}@${connParam.host}:${connParam.port}/${connParam.database}`;
        if (!cache.has(key)) {
            cache.set(key, mysql.createPool({
                host	: connParam.host,
                port	: connParam.port,
                user	: connParam.user,
                password: connParam.password,
                database: connParam.database
            }));
        }

        const pool = cache.get(key);
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(connection);
            });
        });
    }
}