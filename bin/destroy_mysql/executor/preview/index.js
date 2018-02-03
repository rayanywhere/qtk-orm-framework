module.exports = class {
    async exec(actions) {
        for (let action of actions) {
            console.log(`shard config:  host => ${action.host}  port => ${action.port}  database => ${action.database}`);
            console.log(action.sql);
        }
    }
}