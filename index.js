module.exports = {
    Object: require('./src/object'),
    Relation: require('./src/relation'),
    Type: require('./src/lib/type'),
    setup: (path) => {
        require('./src/config').path.object = `${path}/object`;
        require('./src/config').path.relation = `${path}/relation`;
    }
};