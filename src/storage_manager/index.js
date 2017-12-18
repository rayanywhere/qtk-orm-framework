module.exports = {
    list: (sourcePath, type) => require('./list')(sourcePath, type),
    build: (media, type, sourcePath, module) => require(`./build/${media}`)(type, sourcePath, module)
};