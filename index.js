module.exports = {
    config: (opts) => {
		Object.assign(require('./config'), opts);
	},
    Object: require('./src/object'),
    Relation: require('./src/relation')
}

