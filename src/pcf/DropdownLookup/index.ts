import React = require("react");
import * as ReactDOM from "react-dom";
import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { Component } from "./view";
import { PCFControlContextService, StandardControlReact } from "pcf-react";

export class DropdownLookup extends StandardControlReact<IInputs, IOutputs>  {

	/**
	 * Empty constructor.
	 */
	constructor() {
		super();
		this.reactCreateElement = (container, width, height, serviceProvider) => {
			const service = serviceProvider.get<PCFControlContextService>(PCFControlContextService.serviceProviderName);
			ReactDOM.render(React.createElement(Component, {
				context: this.context
			}), container);
		}
	}
}