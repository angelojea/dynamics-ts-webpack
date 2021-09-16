// React
import * as React from "react";

// External
import { ComboBox, Spinner, SpinnerSize } from "@fluentui/react";
import { PCFControlContextService } from "pcf-react";

// PCF generated
import { IInputs } from "./generated/ManifestTypes";

// My own classes
import { DataService } from "../../services";
import { ContactModel } from "../../models";

interface ComponentProps {
	service: PCFControlContextService
}
interface ComponentState {
	loading: boolean,
	contacts: any[]
}

export class Component extends React.Component<ComponentProps, ComponentState> {
	constructor(props: any) {
		super(props);
		this.state = { loading: true, contacts: [] }
	}

	componentDidMount = async () => {
		this.setState({ loading: true });

		try {
			const records = await DataService.runFetch(ContactModel._entityPluralName, `
			<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
			  <entity name="${ContactModel._entityName}">
				<attribute name="${ContactModel._id}" />
				<attribute name="${ContactModel.fullname}" />
				<filter type="and">
				  <condition attribute='${ContactModel.statecode}' operator='eq' value='0' />
				</filter>
			  </entity>
			</fetch>`);
			
			this.setState({
				loading: false,
				contacts: records.map(x => ({ key: x[ContactModel._id], text: x[ContactModel.fullname] }))
			});
		}
		catch (error) {
			this.setState({ loading: false });
			Xrm.Navigation.openErrorDialog({ message: error + '' });
		}
	}

	render = () => this.state.loading ?
		<Spinner size={SpinnerSize.small} />
		:
		<ComboBox
			placeholder="Select a contact"
			selectedKey={this.props.service.getParameters<IInputs>().sampleProperty.raw}
			options={this.state.contacts}
			onChange={(ev, op) => this.props.service.setParameters({ sampleProperty: op?.key + '' })}
		/>;
}
