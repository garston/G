namespace GASton {
    export class ExecutionLog extends BoundObject {
        readonly createdAt: number;
        readonly guid: string;
        readonly params: string;

        constructor(params?: GoogleAppsScript.Events.DoGet['parameter']) {
            super();

            this.guid = JSUtil.GuidUtil.generate();
            this.createdAt = Date.now();

            this.params = JSON.stringify(params);
        }
    }
    Database.register(ExecutionLog, 'EXECUTION_LOG', ['guid', 'createdAt', 'params']);
}
