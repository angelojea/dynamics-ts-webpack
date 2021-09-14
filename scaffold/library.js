const terminal = require('terminal-kit').terminal;
const fs = require('fs');
const constants = require('./common');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const entitiesFilePath = `${__dirname}/${constants.constantsWorkingDir}/${constants.entitiesConstantsFileName}`;
const libIndexFilePath = `${__dirname}/${constants.librariesWorkingDir}/${constants.indexFile}`;
const modelIndexFilePath = `${__dirname}/${constants.modelsWorkingDir}/${constants.indexFile}`;

async function run() {
    try {
        // Receive user's inputs
        const entityName = await new Promise((res, rej) => {
            rl.question(`Enter the entity logical name:\n`, (answer) => res(answer));
        });
        if (!entityName) return;

        const entityPluralName = await new Promise((res, rej) => {
            rl.question(`Enter the entity logical plural name:\n`, (answer) => res(answer));
        });
        if (!entityPluralName) return;

        let libName = await new Promise((res, rej) => {
            rl.question(`Enter the new library name (e.g. my-new-entity):\n`, (answer) => res(answer));
        });
        if (!libName) return;
        libName = libName.replace(/\s/g, '-');

        if (libName.includes('-')) {
            libName = libName.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
        }
        else {
            libName = libName.charAt(0).toUpperCase() + libName.slice(1);
        }

        // Write to Entities constant file
        let entitiesFile = fs.readFileSync(entitiesFilePath).toString();

        const entityMatch = [...entitiesFile.matchAll(/(?<=Entity\s*?{)(.|\r|\n)/g)][0];
        if (entityMatch) {
            entitiesFile = entitiesFile.splice(entityMatch.index, 0, `\n\t${libName} = '${entityName}',`);
        }
        
        const pluralsMatch = [...entitiesFile.matchAll(/(?<=EntityPluralNames\s*?{)(.|\r|\n)/g)][0];
        if (pluralsMatch) {
            entitiesFile = entitiesFile.splice(pluralsMatch.index, 0, `\n\t${libName} = '${entityPluralName}',`);
        }

        fs.writeFileSync(entitiesFilePath, entitiesFile);

        // Create new library file
        const newLibPath = `${__dirname}/${constants.librariesWorkingDir}/${entityName}.ts`;

        fs.writeFileSync(newLibPath,
        `import { AojXrm } from "../services";\n\n` +
        `export const ${libName} = {\n` + 
            `\tinit: (context: Xrm.Events.EventContext): void => {\n` +
                `\t\tAojXrm.updateContext(context);\n` +
            `\t}\n` +
        `}`);

        // Write to lib index file
        let libIndex = fs.readFileSync(libIndexFilePath);
        libIndex += `\nexport * from './${entityName}';`;
        fs.writeFileSync(libIndexFilePath, libIndex);


        // Create new model file
        const newModelPath = `${__dirname}/${constants.modelsWorkingDir}/${entityName}.ts`;

        fs.writeFileSync(newModelPath,
        `import { Entity, EntityPluralNames } from "../constants";\n\n` +
        `export const ${libName}Model = {\n` +
            `\t_entityName: Entity.${libName},\n` +
            `\t_entityPluralName: EntityPluralNames.${libName},\n` +
            `\t_id: Entity.${libName} + 'id',\n` +
        `}\n`);

        // Write to model index file
        let modelIndex = fs.readFileSync(modelIndexFilePath);
        modelIndex += `\nexport * from './${entityName}';`;
        fs.writeFileSync(modelIndexFilePath, modelIndex);

        // Selects module to include the new library
        console.log('Select the module to include the new library:');

        let modules = fs.readdirSync(__dirname + '/' + constants.modulesWorkingDir);
        const noneOption = '<None>';
        modules = modules.map(x => x.split('.')[0]);
        const moduleResponse = await terminal.singleColumnMenu([noneOption, ...modules], { exitOnUnexpectedKey: true }).promise;

        if (!moduleResponse.unexpectedKey
            && moduleResponse.selectedText
            && moduleResponse.selectedText !== noneOption) {
                
            const modulePath = `${__dirname}/${constants.modulesWorkingDir}/${moduleResponse.selectedText}.ts`;
            let moduleContent = fs.readFileSync(modulePath).toString();

            const importMatch = [...moduleContent.matchAll(/(.|\r|\n)(?=} from "..\/src\/libraries";)/g)][0];
            if (importMatch) {
                moduleContent = moduleContent.splice(importMatch.index, 0, `\t${libName},\n`);
            }
            //
            
            const moduleMatch = [...moduleContent.matchAll(/(.|\r|\n)(?=};)/g)][0];
            if (moduleMatch) {
                moduleContent = moduleContent.splice(moduleMatch.index, 0, `\t'${libName}': ${libName},\n`);
            }

            fs.writeFileSync(modulePath, moduleContent);
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        terminal.processExit();
    }
}
run();
