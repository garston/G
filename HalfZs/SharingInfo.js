HalfZs.SharingInfo = function(prettyName, splitPercent, chaseName) {
    this.prettyName = prettyName;
    this.splitPercent = splitPercent;
    this.chaseName = chaseName;
};

HalfZs.SharingInfo.__tableName = 'SHARING_INFO';
HalfZs.SharingInfo.__firstRow = 2;
HalfZs.SharingInfo.__props = ['prettyName', 'splitPercent', 'chaseName'];
