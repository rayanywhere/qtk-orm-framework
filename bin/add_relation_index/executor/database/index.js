const Mysql = require('mysql');
module.exports = class {
    async exec(actions) {
        for (let action of actions) {
            await this._exec(action);
        }
    }

    _exec(action) {
        const connection = Mysql.createConnection({
            host : action.host,
            port : action.port,
            user : action.user,
            password : action.password
        });
    
        return new Promise((resolve, reject) => {
            connection.connect();
            connection.query(action.sql, (err) => {
                connection.end();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}