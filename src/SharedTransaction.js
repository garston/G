HalfZs.SharedTransaction = function(month, year, what, iPayed, percentOwed) {
    this.month = month;
    this.year = year;
    this.what = what;
    this.iPayed = iPayed;
    this.percentOwed = percentOwed;
};

HalfZs.SharedTransaction.__tableName = function(){ return HalfZs.Const.TABLE_NAME; };
HalfZs.SharedTransaction.__firstRow = 2;
HalfZs.SharedTransaction.__propsToCol = {
    month: 1,
    year: 2,
    what: 3,
    iPayed: 5,
    percentOwed: 6
};
