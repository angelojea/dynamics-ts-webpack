// React
import React = require("react");
import * as ReactDOM from "react-dom";

// External
import { PCFControlContextService, StandardControlReact } from "pcf-react";

// PCF generated
import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { Component } from "./view";

export class DropdownLookup extends StandardControlReact<IInputs, IOutputs>  {

	/**
	 * Empty constructor.
	 */
	constructor() {
		super();
		this.reactCreateElement = (container, width, height, serviceProvider) => {
			const service = serviceProvider.get<PCFControlContextService>(PCFControlContextService.serviceProviderName);
			ReactDOM.render(React.createElement(Component, {
				service: service
			}), container);
		}
	}
}