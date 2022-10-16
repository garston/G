GASton.ExecutionLog = function(params) {
    this.guid = JSUtil.GuidUtil.generate();
    this.date = JSUtil.DateUtil.timeString(new Date());
    this.params = JSON.stringify(params);
};

GASton.Database.register(GASton.ExecutionLog, 'EXECUTION_LOG', ['guid', 'date', 'params']);
