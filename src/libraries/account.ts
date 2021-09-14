import { AccountModel, AccountModelPreferredMethodofContact } from "../models";
import { DataService, Form, AojXrm } from "../services";

export const Account = {
    init: (context: Xrm.Events.EventContext): void => {
        AojXrm.updateContext(context);

        const id = Form.getEntityId();

        Form.addOnChange(AccountModel.preferredcontactmethodcode, () => Account.checkContactMethod(id));
    },
    checkContactMethod: async (accountid: string): Promise<void> => {
        let contactmethod = '';

        if (Form.getEntityName() === AccountModel._entityName) {
            contactmethod = Form.getFieldText(AccountModel.preferredcontactmethodcode);
        }
        else {
            const accounts = await DataService.runFetch(AccountModel._entityPluralName, `
            <fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                <entity name='${AccountModel._entityName}'>
                    <attribute name='${AccountModel.name}' />
                    <attribute name='${AccountModel._id}' />
                    <attribute name='${AccountModel.preferredcontactmethodcode}' />
                    <filter type='and'>
                        <condition attribute='${AccountModel._id}' operator='eq' value='${accountid}' />
                    </filter>
                </entity>
            </fetch>`);

            if (accounts.length <= 0) return;
            debugger;
            contactmethod = AccountModelPreferredMethodofContact[accounts[0][AccountModel.preferredcontactmethodcode]];
        }
        
        Xrm.Navigation.openAlertDialog({ text: `Blablabla is ${contactmethod}` });
    }
}
