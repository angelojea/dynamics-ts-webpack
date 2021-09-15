// React
import * as React from "react";

// External
import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import { ComboBox } from "@fluentui/react";
import { PCFControlContextService } from "pcf-react";

// PCF generated
import { IInputs } from "./generated/ManifestTypes";

// My own classes
import { DataService } from "../../services";
import { ContactModel } from "../../models";

interface ComponentProps {
	service: PCFControlContextService
}

export const Component: React.FC<ComponentProps> = ({
	service
}) => {
	const [loading, setLoading] = React.useState<boolean>(true);
	const [contacts, setContacts] = React.useState<any[]>([]);

	React.useEffect(() => {

		DataService.runFetch(ContactModel._entityPluralName, `
			<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
			  <entity name="${ContactModel._entityName}">
				<attribute name="${ContactModel._id}" />
				<attribute name="${ContactModel.fullname}" />
				<filter type="and">
				  <condition attribute='${ContactModel.statecode}' operator='eq' value='0' />
				</filter>
			  </entity>
			</fetch>`)
			.then(records =>{
				setContacts(records.map(x => ({ key: x[ContactModel._id], text: x[ContactModel.fullname] })));
				setLoading(false);
			})
			.catch(error => {
				setLoading(false);
				Xrm.Navigation.openErrorDialog({ message: error + '' });
			});
	});

	return (
		loading ?
			<Spinner size={SpinnerSize.small} />
			:
			<ComboBox
				placeholder="Select a contact"
				selectedKey={service.getParameters<IInputs>().sampleProperty.raw}
				options={contacts}
				onChange={(ev, op) => service.setParameters({ sampleProperty: op?.key + '' })}
			/>);
};