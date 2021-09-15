import { AojXrm } from ".";
import { ControlRequiredLevel, Entity } from "../constants";

export const Form = {
    getQueryParameter: (name: string, url: string = window.location.href): string => {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return '';
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
    getFormName: (form = AojXrm.Page): string => {
        return form.ui.formSelector.getCurrentItem() ? form.ui.formSelector.getCurrentItem().getLabel() : "";        
    },

    lockField: (field: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setDisabled(true);
    },
    unlockField: (field: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setDisabled(false);
    },
    lockFormFields: (flag: boolean, form = AojXrm.Page): void => {
        form.ui.controls.forEach((control) => {
            const controlType = control.getControlType();
            if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid") {
                //@ts-ignore
                control.setDisabled(flag);
            }
        });
    },
    setFieldsVisibility: (flag: boolean, fields: string[], mandatoryDictionary: any = null, form = AojXrm.Page): void => {
        fields.forEach(x => {
            const control = form.ui.controls.get(x);
            if (!control) return;
            //@ts-ignore
            control.setVisible(flag);

            if (mandatoryDictionary) {
                const att = form.getAttribute(control.getName());
                if (att && mandatoryDictionary[control.getName()]) {
                    form.getAttribute(control.getName()).setRequiredLevel(mandatoryDictionary[control.getName()]);
                }
            }
        });
    },
    getRequiredLevel: (field: string, form = AojXrm.Page): ControlRequiredLevel => {
        const att = form.getAttribute(field);
        if (!att) return ControlRequiredLevel.None;
        return att.getRequiredLevel() === 'required' ? ControlRequiredLevel.Required : ControlRequiredLevel.None;
    },
    changeRequiredLevel: (field: string, requiredLevel: ControlRequiredLevel, form = AojXrm.Page): void => {
        const att = form.getAttribute(field);
        if (!att) return;
        att.setRequiredLevel(requiredLevel);
    },
    hideControls: (fields: any[], initialLoad: boolean, form = AojXrm.Page): void => {
        // Made the hiding/showing of fields async to not freeze the page
        const promises: any[] = [];
        fields.forEach((x: string) => {
            promises.push(new Promise(() => {
                const control = form.ui.controls.get(x);
                //@ts-ignore
                if (control) control.setVisible(false);
                form.getAttribute(x).setRequiredLevel(ControlRequiredLevel.None);
                if (initialLoad) return;
                form.getAttribute(x).setValue(null);
            }));
        });
        Promise.all(promises);
    },
    showControls: (fields: any[], required: boolean, form = AojXrm.Page): void => {
        const requiredLevel = required ? ControlRequiredLevel.Required : ControlRequiredLevel.None;
        // Made the hiding/showing of fields async to not freeze the page
        const promises: any[] = [];
        fields.forEach((x: string) => {
            promises.push(new Promise(() => {
                const control = form.ui.controls.get(x);
                //@ts-ignore
                if (control) control.setVisible(true);
                form.getAttribute(x).setRequiredLevel(requiredLevel);
            }));
        });
        Promise.all(promises);
    },
    showOrHideControls: (fields: any[], showControl: boolean, required: boolean, clearOnHide: boolean, form = AojXrm.Page): void => {
        if (showControl) {
            Form.showControls(fields, required, form);
        }
        else {
            Form.hideControls(fields, !clearOnHide, form);
        }
    },
    showOrHideControl: (field: string, showControl: boolean, required: boolean, clearOnHide: boolean, form = AojXrm.Page): void => {
        Form.showOrHideControls([field], showControl, required, clearOnHide, form);
    },

    setErrorMsgOnField: (field: string, msg: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setNotification(msg);
    },
    clearErrorMsgOnField: (field: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.clearNotification();
    },

    hideControl: (field: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setVisible(false);
    },
    showControl: (field: string, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setVisible(true);
    },
    setControlVisibility: (field: string, flag: boolean, form = AojXrm.Page): void => {
        const control = form.ui.controls.get(field);
        //@ts-ignore
        if (control) control.setVisible(flag);
    },

    hideTab: (tabName: string, form = AojXrm.Page): void => {
        const tab = form.ui.tabs.get(tabName);
        if (tab) tab.setVisible(false);
    },
    showTab: (tabName: string, form = AojXrm.Page): void => {
        const tab = form.ui.tabs.get(tabName);
        if (tab) tab.setVisible(true);
    },
    setTabVisibility: (tabName: string, flag: boolean, form = AojXrm.Page): void => {
        const tab = form.ui.tabs.get(tabName);
        if (tab) tab.setVisible(flag);
    },

    hideSection: (sectionName: string, form = AojXrm.Page): void => {
        //@ts-ignore
        const tabs = Array.from(form.ui.tabs.getAll());

        tabs.forEach((tab: any) => {
            const section = tab.sections.get(sectionName);
            if (!section) return
            
            section.setVisible(false);

            const controls = Array.from(section.controls.getAll());
            controls.forEach((control: any) => control.setVisible(false));
        });
    },
    showSection: (sectionName: string, form = AojXrm.Page): void => {
        //@ts-ignore
        const tabs = Array.from(form.ui.tabs.getAll());

        tabs.forEach((tab: any) => {
            const section = tab.sections.get(sectionName);
            if (!section) return;
            
            section.setVisible(true);

            const controls = Array.from(section.controls.getAll());
            controls.forEach((control: any) => control.setVisible(true));
        });
    },
    setSectionVisibility: (sectionName: string, flag: boolean, form = AojXrm.Page): void => {
        //@ts-ignore
        const tabs = Array.from(form.ui.tabs.getAll());

        tabs.forEach((tab: any) => {
            const section = tab.sections.get(sectionName);
            if (!section) return;
            
            section.setVisible(flag);

            const controls = Array.from(section.controls.getAll());
            controls.forEach((control: any) => control.setVisible(flag));
        });
    },
    addPreSearch: (field: string, fetchXml: (lookup: any) => void, form = AojXrm.Page): void => {
        const targetLookup: any = form.getControl(field);
        if (!targetLookup || targetLookup.length <= 0) return;

        targetLookup.addPreSearch(() => fetchXml(targetLookup));
    },
    addOnChange: (field: string, handler: () => any, runNow = false, form = AojXrm.Page): void => {
        const att = form.getAttribute(field);
        if (att) {
            att.addOnChange(handler);
            if (runNow) handler();
        }
    },
    addOnSave: (handler: (evt?: Xrm.Events.SaveEventContext) => void | any, runNow = false, form = AojXrm.Page): void => {
        //@ts-ignore
        form.data.entity.addOnSave(handler);
        if (runNow) handler();
    },
    addOnPostSave: (handler: () => void | any, runNow = false, form = AojXrm.Page): void => {
        //@ts-ignore
        form.data.entity.addOnPostSave(handler);
        if (runNow) handler();
    },
    getFieldValue: (field: string, form = AojXrm.Page): any => {
        const att = form.getAttribute(field);
        return att ? att.getValue() : null;
    },
    getFieldText: (field: string, form = AojXrm.Page): any => {
        const att = form.getAttribute(field);
        //@ts-ignore
        return att ? att.getText() : null;
    },
    setFieldValue: (field: string, value: any, form = AojXrm.Page): void => {
        const att = form.getAttribute(field);
        if (att) att.setValue(value);
    },
    clearFieldValue: (field: string, form = AojXrm.Page): void => {
        const prev = Form.getRequiredLevel(field, form);

        Form.changeRequiredLevel(field, ControlRequiredLevel.None, form);
        Form.setFieldValue(field, null, form);
        Form.changeRequiredLevel(field, prev, form);
    },
    refreshSubgrid: (name: string, form = AojXrm.Page): void => {
        const subgrid = form.ui.controls.get(name);
        //@ts-ignore
        if (subgrid) subgrid.refresh();
    },

    getElementByXPath: (xpath: string): any => {
        const workingDoc = window.top.document;

        return workingDoc.evaluate(xpath, workingDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    },
    showFormNotification: (msg: string, type: Xrm.FormNotificationLevel): void => {
        AojXrm.Page.ui.setFormNotification(msg, type, '');
    },    
    hideFormNotification: (): void => {
        //@ts-ignore
        AojXrm.Page.ui.clearFormNotification();
    },   
    isCreate: (form = AojXrm.Page): boolean => form.ui.getFormType() === XrmEnum.FormType.Create,
    isUpdate: (form = AojXrm.Page): boolean => form.ui.getFormType() === XrmEnum.FormType.Update,
    getCurrentUser: (): any => {
        const globalContext = Xrm.Utility.getGlobalContext();
        const currentUser = new Array(1);
        currentUser[0] = new Object();
        currentUser[0].entityType = Entity.User;
        currentUser[0].id = globalContext.userSettings.userId;
        currentUser[0].name = globalContext.userSettings.userName;
        return currentUser;
    },
    getEntityName: (form = AojXrm.Page): string => {
        return form.data.entity.getEntityName();
    },
    getEntityId: (form = AojXrm.Page): string => {
        return form.data.entity.getId().replace('{', '').replace('}', '');
    }
}