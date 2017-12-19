const walk = require('klaw-sync');
const fs = require('fs');

module.exports = (sourcePath, type) => {
    let moduleList = [];
    let schemaPath = `${sourcePath}/schema/${type}/`;
    walk(schemaPath, {
        nodir: true,
        filter: item => item.path.endsWith('.js')
    }).forEach((item) => {
        if (!fs.existsSync(`${item.path.replace('schema', 'router')}`)) {
            throw new Error(`router file of ${item.path} is lost`);
        }
        const module = item.path.replace(schemaPath, '').replace(/\//g, '.').replace('.js', '');
        moduleList.push(module);
    });

    return moduleList;
};