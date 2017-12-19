const walk = require('klaw-sync');
const fs = require('fs');

module.exports = (schemaDir, routerDir, type) => {
    let moduleList = [];
    walk(schemaDir, {
        nodir: true,
        filter: item => item.path.endsWith('.js')
    }).forEach((item) => {
        if (!fs.existsSync(`${item.path.replace(schemaDir, routerDir)}`)) {
            throw new Error(`router file of ${item.path} is lost`);
        }
        const module = item.path.replace(`${schemaDir}/`, '').replace(/\//g, '.').replace('.js', '');
        moduleList.push(module);
    });

    return moduleList;
};