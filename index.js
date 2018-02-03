module.exports = {
    Object: require('./src/object'),
    Relation: require('./src/relation'),
    Type: require('./src/lib/type'),
    setup: ({objectPath, relationPath}) => {
        require('./src/config').path.object = objectPath;
        require('./src/config').path.relation = relationPath;
    }
};
