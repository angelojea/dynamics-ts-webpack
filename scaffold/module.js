const fs = require('fs');
const constants = require('./common');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function run() {
    let moduleName = await new Promise((res, rej) => {
        rl.question(`Enter the name of the new module (e.g. MyNewModule):\n`, (answer) => res(answer));
    });
    if (!moduleName) return;

    if (moduleName.includes('-')) {
        moduleName = moduleName.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
    }
    
    fs.writeFileSync(__dirname + '/' + constants.modulesWorkingDir + '/' + constants.prefix + '_' + moduleName + '.ts',
    `import {\n} from "../src/libraries";

(window as any).${constants.moduleAlias} = {
};`);

    const webpackConfig = fs.readFileSync(__dirname + '/' + constants.webpackConfigFilePath).toString();
    const entryMatch = [...webpackConfig.matchAll(/(?<=(entry: {(.|\r|\n)*))}/g)][0];

    if (!entryMatch) process.exit();
    
    fs.writeFileSync(__dirname + '/' + constants.webpackConfigFilePath,
        webpackConfig.splice(entryMatch.index, 0, `\n\t${constants.prefix + '_' + moduleName}: \'${constants.webpackRelativePathToModules + constants.prefix + '_' + moduleName + '.ts'}\',`));
    
    process.exit();
}
run();
