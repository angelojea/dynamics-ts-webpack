export class AojXrm {
    private static _Context: Xrm.Events.EventContext;

    public static get Page(): Xrm.FormContext {
        return this._Context ? this._Context.getFormContext() : Xrm.Page as Xrm.FormContext;
    }

    public static updateContext(context: Xrm.Events.EventContext): void {
        this._Context = context;
    }
}
