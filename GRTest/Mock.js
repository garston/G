GRTest.Mock = {};

GRTest.Mock.create = (model, defaultValuesByModel, rowsOfOverrides) => [model, rowsOfOverrides.map(overrides => {
    const values = defaultValuesByModel.find(a => a[0].__tableName === model.__tableName)[1].slice();
    Object.entries(overrides).forEach(override => {
        const propIndex = model.__props.indexOf(override[0]);
        if(propIndex < 0) {
            console.error(override);
            throw 'invalid override';
        }
        values[propIndex] = override[1];
    });
    return values;
})];

GRTest.Mock.gmailThread = (msgs) => ({
    getMessages: () => msgs.map(m => ({
        getFrom: () => m.from
    }))
});

GRTest.Mock.guid = (model, id) => `${model.__tableName}${id}`;
