GASton.ExecutionLog = function(params) {
    this.guid = JSUtil.GuidUtil.generate();
    this.createdAt = Date.now();
    this.params = JSON.stringify(params);
};

GASton.Database.register(GASton.ExecutionLog, 'EXECUTION_LOG', ['guid', 'createdAt', 'params']);
