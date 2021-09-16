import { EntityPluralNames } from "../constants";

const apiVersion = 'v9.1';

export const DataService = {
    retrieveRecord: (entityPluralName: EntityPluralNames, id: string, query = ''): Promise<any> => {
        id = id.replace('{', '').replace('}', '');
        
        return new Promise((res) => {
            const req = new XMLHttpRequest();
            let result: any = {};
            req.open('GET', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName + '(' + id + ')' + '?' + query, true);
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        result = JSON.parse(this.response);
                        res(result);
                    }
                    else res(null);
                }
            };
            req.send();
        });
    },
    retrieveRecords: (entityPluralName: EntityPluralNames, query = ''): Promise<any[]> => {
        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            let results: any[] = [];
            req.open('GET', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName + '?' + query, true);
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        results = JSON.parse(this.response).value || [];
                        res(results);
                    }
                    else rej(this.statusText);
                }
            };
            req.send();
        });
    },
    create: (entityPluralName: EntityPluralNames, entity: any): Promise<any> => {

        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open('POST', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName, true);
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 204) {
                        const uri = this.getResponseHeader('OData-EntityId');
                        const regExp = /\(([^)]+)\)/;
                        const matches = regExp.exec(uri!);
                        if (matches && matches.length > 0) {
                            const newEntityId = matches[1];
                            res(newEntityId);
                        }
                        else res(null);
                    }
                    else rej(this.statusText);
                }
            };
            req.send(JSON.stringify(entity));
        });
    },
    update: (entityPluralName: EntityPluralNames, id: string, entity: any): void => {
        id = id.replace('{', '').replace('}', '');
        
        const req = new XMLHttpRequest();
        req.open('PATCH', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName + '(' + id + ')', false);
        req.setRequestHeader('OData-MaxVersion', '4.0');
        req.setRequestHeader('OData-Version', '4.0');
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    //Success - No Return Data - Do Something
                }
                else throw this.statusText;
            }
        };
        req.send(JSON.stringify(entity));
    },
    delete: (entityPluralName: EntityPluralNames, id: string): void => {
        id = id.replace('{', '').replace('}', '');

        const req = new XMLHttpRequest();
        req.open('DELETE', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName + '(' + id + ')', false);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        req.setRequestHeader('OData-MaxVersion', '4.0');
        req.setRequestHeader('OData-Version', '4.0');
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204 || this.status === 1223) {
                    //Success - No Return Data - Do Something
                }
                else throw this.statusText;
            }
        };
        req.send();
    },
    associate: (childPluralEntity: string, childId: string, parentPluralEntity: string, parentId: string, relationshipName: string): Promise<any> => {
        childId = childId.replace('{', '').replace('}', '');
        parentId = parentId.replace('{', '').replace('}', '');
        
        const association = {
            '@odata.id': Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + childPluralEntity + '(' + childId + ')'
        };
        
        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open('POST', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + parentPluralEntity + '(' + parentId + ')/' + relationshipName + '/$ref', true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.onreadystatechange = function() {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200 || this.status === 204) {
                        res(null);
                    }
                    else throw rej(this.statusText);
                }
            };
            req.send(JSON.stringify(association));
        });
    },
    function: (functionName: string, parameters: any): Promise<any> => {
        const paramsFormat: string[] = [];
        const params: string[] = [];

        Object.keys(parameters).forEach(x => {
            paramsFormat.push(x + '=@' + x);
            params.push('@' + x + '=' + encodeURIComponent(parameters[x]));
        });

        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + functionName + '(' + paramsFormat.join(',') + ')?' + params.join('&'), true);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        if (this.response) res(JSON.parse(this.response))
                        else res(null);
                    }
                    else throw rej(this.statusText);
                }
            };
            req.send();
        });
    },
    action: (actionName: string, parameters: any): Promise<any> => {

        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open('POST', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + actionName, false);
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200 || this.status === 204) {
                        if (this.response) res(JSON.parse(this.response))
                        else res(null);
                    }
                    else throw rej(this.statusText);
                }
            };
            req.send(JSON.stringify(parameters));
        });
    },
    runWorkflow: (workflowID: string, parameters: any): void => {
        const req = new XMLHttpRequest();
        req.open('POST', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + 'workflows(' + workflowID + ')/Microsoft.Dynamics.CRM.ExecuteWorkflow', true);
        req.setRequestHeader('OData-MaxVersion', '4.0');
        req.setRequestHeader('OData-Version', '4.0');
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    //Success - No Return Data - Do Something
                }
                else throw this.statusText;
            }
        };
        req.send(JSON.stringify(parameters));
    },
    runFetch: (entityPluralName: EntityPluralNames, fetch: string): Promise<any[]> => {

        return new Promise((res, rej) => {
            fetch = fetch.replace(/\n/g, '').replace(/\s\s+/g, '');

            let results: any[] = [];

            const req = new XMLHttpRequest();
            req.open('GET', Xrm.Utility.getGlobalContext().getClientUrl() + '/api/data/' + apiVersion + '/' + entityPluralName + '?fetchXml=' + fetch, true);
            req.setRequestHeader('OData-MaxVersion', '4.0');
            req.setRequestHeader('OData-Version', '4.0');
            req.setRequestHeader('Accept', 'application/json');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        results = JSON.parse(this.response).value || [];
                        res(results);
                    }
                    else rej(this.statusText);
                }
            };
            req.send();
        });
    },
}