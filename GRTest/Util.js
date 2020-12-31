GRTest.Util = {};

GRTest.Util.expectedDbUpdatesNewRow = (model, rowNum, overrides) => [
    [GRTest.UPDATE_TYPES.DB.APPEND_ROW, model],
    ...GRTest.Mock.rowOfValues(model, overrides).slice(1).map((val, i) => [GRTest.UPDATE_TYPES.DB.SET_VALUE, model, rowNum, i + 2, val])
];
