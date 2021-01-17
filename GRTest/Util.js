GRTest.Util = {};

GRTest.Util.expectedDbUpdatesNewRow = (model, rowNum, overrides) => [
    [GASton.UPDATE_TYPES.DB.INSERT, model],
    ...GRTest.Mock.rowOfValues(model, overrides).slice(1).map((val, i) => [GASton.UPDATE_TYPES.DB.UPDATE, model, rowNum, i + 2, val])
];
