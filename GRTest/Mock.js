GRTest.Mock = {};
GRTest.Mock.defaultValuesByModel = [];

GRTest.Mock.create = (model, rowsOfOverrides) => {
    const defaultValues = GRTest.Mock.defaultValuesByModel.find(a => a[0].__tableName === model.__tableName)[1];
    return [model, rowsOfOverrides.map(rowOverrides => {
        const values = defaultValues.slice();
        Object.entries(rowOverrides).forEach(override => {
            const propIndex = model.__props.indexOf(override[0]);
            if(propIndex < 0) {
                console.error(override);
                throw 'invalid override';
            }
            values[propIndex] = override[1];
        });
        return values;
    })];
};

GRTest.Mock.guid = (model, id) => `${model.__tableName}${id}`;
