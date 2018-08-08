HalfZs.SharingInfo = function(prettyName, splitPercent, chaseName) {
    this.prettyName = prettyName;
    this.splitPercent = splitPercent;
    this.chaseName = chaseName;
};

GASton.Database.register(HalfZs.SharingInfo, 'SHARING_INFO', ['prettyName', 'splitPercent', 'chaseName'], true);
