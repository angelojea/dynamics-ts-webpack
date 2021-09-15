import * as React from "react";
import { useEffect } from "react";

import { Spinner, SpinnerSize } from "office-ui-fabric-react";

import { DataService, AojXrm } from "../../services";
import { ContactModel } from "../../models";

import { IInputs } from "./generated/ManifestTypes";

let _loading: boolean = true;

export function DropdownLookup(props: {
  context: ComponentFramework.Context<IInputs>,
  notifyOutputChanged: () => void,
  forceUpdateView: () => void,
}) {

  useEffect(() => {
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
      .then(records => {
        _loading = false;
      })
      .catch(error => {
        _loading = false;
        Xrm.Navigation.openErrorDialog({ message: error + '' });
      })
      .finally(() => {
        props.forceUpdateView();
        props.notifyOutputChanged();
      });
  });

  return (
    _loading ?
      <Spinner size={SpinnerSize.small} />
      :
      <>
        <h3>Deu bom bagarai</h3>
      </>);
}