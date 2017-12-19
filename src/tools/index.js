module.exports = {
    list: (schemaDir, routerDir, type) => require('./list')(schemaDir, routerDir, type),
    build: (media, schemaDir, routerDir, type, module, preview) => require(`./build/${media}`)(schemaDir, routerDir, type, module, preview),
    addIndex: (media, schemaDir, routerDir, type, module, field, preview) => require(`./add_index/${media}`)(schemaDir, routerDir, type, module, field, preview)
};