namespace GASton {
    export const ExecutionLog = GASton.Database.register(class {
        public createdAt: number;
        public guid: string;
        public params: string;

        constructor(params: GoogleAppsScript.Events.DoGet['parameter']) {
            this.guid = JSUtil.GuidUtil.generate();
            this.createdAt = Date.now();

            this.params = JSON.stringify(params);
        }
    }, 'EXECUTION_LOG', ['guid', 'createdAt', 'params']);
}
