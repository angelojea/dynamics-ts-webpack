import { ContactModel } from "../models";
import { Form, AojXrm } from "../services";
import { Account } from "./account";

export const Contact = {
    init: (context: Xrm.Events.EventContext): void => {
        AojXrm.updateContext(context);

        Form.addOnChange(ContactModel.parentcustomerid, Contact.checkAccountsContactMethod);
    },
    checkAccountsContactMethod: (): void => {
        const account = Form.getFieldValue(ContactModel.parentcustomerid);
        if (!account) return;

        Account.checkContactMethod(account[0].id);
    }
}
