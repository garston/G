GRTest.Mock = {};
GRTest.Mock.defaultValuesByModel = [];

GRTest.Mock.create = (model, rowsOfOverrides) => [model, rowsOfOverrides.map(overrides => GRTest.Mock.rowOfValues(model, overrides))];

GRTest.Mock.gmailThread = (msgs) => ({
    getMessages: () => msgs.map(m => ({
        getFrom: () => m.from
    }))
});

GRTest.Mock.guid = (model, id) => `${model.__tableName}${id}`;

GRTest.Mock.rowOfValues = (model, overrides) => {
    const values = GRTest.Mock.defaultValuesByModel.find(a => a[0].__tableName === model.__tableName)[1].slice();
    Object.entries(overrides).forEach(override => {
        const propIndex = model.__props.indexOf(override[0]);
        if(propIndex < 0) {
            console.error(override);
            throw 'invalid override';
        }
        values[propIndex] = override[1];
    });
    return values;
};
