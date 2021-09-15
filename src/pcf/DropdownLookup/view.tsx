import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import * as React from "react";

import { IInputs } from "./generated/ManifestTypes";

import { DataService } from "../../services";
import { ContactModel } from "../../models";
import { Dropdown } from "@fluentui/react";

export interface ComponentProps {
	context: ComponentFramework.Context<IInputs>,
}
interface ComponentState {
	loading: boolean,
	contacts: any[]
}

export class Component extends React.Component<ComponentProps, ComponentState> {
	public result: string = '';

	constructor(props: ComponentProps) {
		super(props);

		this.state = { contacts: [], loading:  true }
	}

	componentDidMount = async (): Promise<void> => {
		try {
			this.setState({ loading: true });

			let records = await DataService.runFetch(ContactModel._entityPluralName, `
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
				contacts: records.map(x => ({ key: x[ContactModel._id], text: x[ContactModel.fullname] })),
				loading: false
			});
		}
		catch (error) {
			this.result = this.result;
			this.setState({ loading: false });
			Xrm.Navigation.openErrorDialog({ message: error + '' });
		}
	}

	render = () => {
		return (
			this.state.loading ?
				<Spinner size={SpinnerSize.small} />
				:
				<Dropdown placeholder="Select a contact" options={this.state.contacts} />);
	}
}