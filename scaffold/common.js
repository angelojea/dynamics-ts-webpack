if (!String.prototype.splice) {
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

module.exports = {
    moduleAlias: 'AOJ',
    prefix: 'aoj',

    modulesWorkingDir: '../modules',
    librariesWorkingDir: '../src/libraries',
    modelsWorkingDir: '../src/models',
    constantsWorkingDir: '../src/constants',

    webpackRelativePathToModules: './modules/',
    webpackConfigFilePath: '../webpack.config.common.js',

    entitiesConstantsFileName: 'Entities.ts',
    indexFile: 'index.ts',

    //Models config
    outputPath: 'C:\\Users\\Angel\\Documents\\repos\\dynamics-ts-webpack\\src\\models',
    // outputPath: 'C:\\Users\\Angel\\Desktop\\models',
    fieldsPrefix: 'aoj',
    crmConfig: {
        url: 'https://org94ea73b8.crm.dynamics.com/',
        clientId: "3001a7d0-b4e5-43e6-9213-20a879b3833b",
        clientSecret: "qfl7Q~sJrm0P0X09p3xc3s.y5jWnAskolTliP",
        azureTenantId: '05cada01-c884-4f47-9e36-a315c58eaa07'
    }
}