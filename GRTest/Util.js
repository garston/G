GRTest.Util = {};

GRTest.Util.createReq = (parameter = {}) => ({parameter});

GRTest.Util.expectedDbUpdatesNewRow = (model, rowNum, values) => [
    [GASton.UPDATE_TYPES.DB.INSERT, model],
    ...values.map((val, i) => [GASton.UPDATE_TYPES.DB.UPDATE, model, rowNum, i + 2, val])
];
