if (!String.prototype.splice) {
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

module.exports = {
    moduleAlias: 'MillardD365',
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
    outputPath: 'C:\\Users\\Angel\\Desktop\\models',
    fieldsPrefix: 'aoj',
    crmConfig: {
        url: 'https://org328b43f9.crm.dynamics.com/',
        clientId: "6ecdbb25-75c0-43b8-85f7-47b0143a9920",
        clientSecret: "N_-84Lca194c2G8ef~rx44G2y94Up3kR~7",
        azureTenantId: '901ec0f3-4101-4bf0-b3af-9ae8126d0225'
    }
}