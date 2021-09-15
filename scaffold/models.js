const msal = require('@azure/msal-node');
const request = require("request");
const fs = require("fs");

const config = require('./common');

const entityPlaceholder = `#entities-placeholder#`; 
const entityPluralPlaceholder = `#plural-placeholder#`; 

async function run() {
    const cca = new msal.ConfidentialClientApplication({
        auth: {
            authority: "https://login.microsoftonline.com/" + config.crmConfig.azureTenantId,
            clientId: config.crmConfig.clientId,
            clientSecret: config.crmConfig.clientSecret
        },
    });

    const clientCredentialRequest = { scopes: [config.crmConfig.url+"/.default"], skipCache: true, };

    try {
        const authResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
        const metadata = await new Promise((res, rej) => {
            request.get(config.crmConfig.url + '/api/data/v9.0/EntityDefinitions?$select=DisplayName,LogicalName,LogicalCollectionName&$expand=Attributes($select=DisplayName,LogicalName,AttributeType)',
                { headers: { 'Authorization': 'Bearer ' + authResponse.accessToken } },
                (err, resp) => { if (err) rej(err); else res(resp); });
        });

        const entities = JSON.parse(metadata.body).value;

        let entitiesConstantFile = `export enum Entity {\n${entityPlaceholder}\n}\n\nexport enum EntityPluralNames {\n${entityPluralPlaceholder}\n}`;
        let entitiesConstantsEntities = '';
        let entitiesConstantsPlurals = '';
        let modelsIndexFile = '';

        const filesToCreate = [];
        const optionSetsToRetrieve = [];
        const attDisplayNameDictionary = {};

        // Entities
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            const entityLogicalName = entity['LogicalName'];
            const entityPluralName = entity['LogicalCollectionName'];
            let entityDisplayName = '';
            if (!entity.DisplayName
                || !entity.DisplayName.UserLocalizedLabel
                || !entity.DisplayName.UserLocalizedLabel.Label) {
                entityDisplayName = entityLogicalName;
            }
            else entityDisplayName = entity.DisplayName.UserLocalizedLabel.Label.replace(/[^a-zA-Z]/g, '');

            if (filesToCreate.find(x => x.entityDisplayName === entityDisplayName)) {
                entityDisplayName = entityDisplayName + "Alt";
            }

            let fileContent = `import { Entity, EntityPluralNames } from '../constants/Entities';`;
            fileContent += `\n\nexport const ${entityDisplayName}Model = {`;
            fileContent += `\n\t_entityName: Entity.${entityDisplayName},`;
            fileContent += `\n\t_entityPluralName: EntityPluralNames.${entityDisplayName},`;
            fileContent += `\n\t_id: Entity.${entityDisplayName} + 'id',\n`;
            fileContent += `#fields_placeholder#`;
            fileContent += `\n}`;

            let fieldsPlaceholder = '';

            modelsIndexFile += `export * from './${entityLogicalName}';\n`;
            entitiesConstantsEntities += `\t${entityDisplayName} = '${entityLogicalName}',\n`;
            entitiesConstantsPlurals += `\t${entityDisplayName} = '${entityPluralName}',\n`;
            
            // Attributes
            for (let j = 0; j < entity.Attributes.length; j++) {
                const attribute = entity.Attributes[j];

                const attLogicalName = attribute.LogicalName;
                let attDisplayName = '';
                if (!attribute.DisplayName
                    || !attribute.DisplayName.UserLocalizedLabel
                    || !attribute.DisplayName.UserLocalizedLabel.Label) {
                    attDisplayName = attLogicalName;
                }
                else attDisplayName = attribute.DisplayName.UserLocalizedLabel.Label.replace(/[^a-zA-Z0-9]/g, '');

                // OptionSet Attributes
                // Only adds to the dictionary if it's not there already
                if (attribute['AttributeType'] === 'Picklist'
                && !Object.values(attDisplayNameDictionary).find(x => x === attDisplayNameDictionary)) {

                    optionSetsToRetrieve.push({
                        entity: entityLogicalName,
                        attribute: attLogicalName
                    });
                    fileContent += `\n\n#${entityLogicalName}-${attLogicalName}#`;
                    attDisplayNameDictionary[entityLogicalName+attLogicalName] = attDisplayName;
                }

                let attLogicalNameAlias = attribute.LogicalName.replace(config.fieldsPrefix + '_', '');
                fieldsPlaceholder += `\n\t${attLogicalNameAlias}: '${attribute.LogicalName}',`;
                if (attribute['AttributeType'] === 'Lookup')
                    fieldsPlaceholder += `\n\t${attLogicalNameAlias}Lookup: '_${attribute.LogicalName}_value',`;
            };

            filesToCreate.push({
                entity: entityLogicalName,
                entityDisplayName: entityDisplayName,
                content: fileContent.replace('#fields_placeholder#', fieldsPlaceholder)
            });
        };

        const optionSetsMetadata = [];
        let pageNumber = 1;

        while (true) {
            const fetchXml =  encodeURIComponent(`
            <fetch count="5000" page="${pageNumber}">
                <entity name="stringmap">
                    <attribute name="objecttypecode" />
                    <attribute name="attributename" />
                    <attribute name="value" />
                    <attribute name="attributevalue" />
                    <order attribute="stringmapid" descending="false" />
                </entity>
            </fetch>`.replace(/\s{2,}|\t/g, ' '))


            const response = await new Promise((res, rej) => {
                request.get(config.crmConfig.url + `/api/data/v9.0/stringmaps?fetchXml=` + fetchXml,
                    { headers: { 'Authorization': 'Bearer ' + authResponse.accessToken, 'Prefer': 'odata.include-annotations=*' } },
                    (err, resp) => { if (err) res(err); else res(resp); });
            });
            const responseBody = JSON.parse(response.body);

            if (responseBody.value) responseBody.value.forEach(x => optionSetsMetadata.push(x));

            if (!responseBody['@Microsoft.Dynamics.CRM.morerecords']) break;
            pageNumber++;
        }

        filesToCreate.forEach(x => {
            const entityName = x.entity;
            const entityDisplayName = x.entityDisplayName;

            const attributes = optionSetsMetadata
                                .filter(y => y['objecttypecode'] === entityName)
                                .map(y => y['attributename'])
                                .filter((v, i, s) => s.indexOf(v) === i);
            
            attributes.forEach(y => {
                let optionSets = optionSetsMetadata
                    .filter(z => z['objecttypecode'] === entityName & z['attributename'] === y)
                    .map(z => ({ label: z['value'], value: z['attributevalue'] }));
                
                optionSets = [...new Map(optionSets.map(item => [item['label'], item])).values()];
                
                let enumContent = `export enum ${entityDisplayName}Model${attDisplayNameDictionary[entityName+y]} {`;
                
                for (let k = 0; k < optionSets.length; k++) {
                    const optionSet = optionSets[k];
                    let optionSetLabel = optionSet.label.replace(/[^a-z0-9\$]/gi, '') || 'Empty' + Date.now();
                    const optionSetValue = optionSet.value;

                    if (optionSetLabel[0].match(/^[0-9]/g)) optionSetLabel = 'N' + optionSetLabel;

                    enumContent += `\n\t${optionSetLabel} = ${optionSetValue},`;
                }
                enumContent += `\n}`;

                if (x.content.includes(enumContent)) return;
                x.content = x.content.replace(`#${entityName}-${y}#`, enumContent);
            });

            x.content = x.content.replace(/\n\n#(.*)?#/g, '');

            fs.writeFileSync(`${config.outputPath}\\${x.entity}.ts`, x.content);
        });

        entitiesConstantFile = entitiesConstantFile.replace(entityPlaceholder, entitiesConstantsEntities).replace(entityPluralPlaceholder, entitiesConstantsPlurals);
        fs.writeFileSync(`${__dirname}\\${config.constantsWorkingDir}\\${config.entitiesConstantsFileName}`, entitiesConstantFile);

        fs.writeFileSync(`${__dirname}\\${config.modelsWorkingDir}\\${config.indexFile}`, modelsIndexFile);
    }
    catch (error) {
        console.log('deu ruim bagarai');
        console.log(error);
    }
}

run();