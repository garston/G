GRTest = {};

GRTest.describe = (fnName, fnWithTests) => {
    GASton.checkProdMode = str => {
        console.log(str);
        return true;
    };

    GRTest.it = (desc, dbRowsOfOverridesByModel, threadsByQuery, expectedUpdates) => {
        const logBeginEnd = c => console.warn(['', ` ${fnName} ${desc} `, ''].join(JSUtil.ArrayUtil.range(38).map(() => c).join('')));
        logBeginEnd('+');
        GASton.Database._cache = {};

        const actualUpdates = [];
        window.GmailApp = {
            search: q => {
                const threads = threadsByQuery[q] || [];
                console.log('GmailApp.search', q, threads);
                return threads.map(GRTest.Mock.gmailThread);
            }
        };
        window.SpreadsheetApp = {
            getActiveSpreadsheet: () => ({
                getName: () => 'SPREADSHEET_NAME',
                getSheetByName: tableName => ({
                    appendRow: () => actualUpdates.push([GASton.UPDATE_TYPES.DB.INSERT, tableName]),
                    getDataRange: () => ({
                        getValues: () => {
                            const overrides = dbRowsOfOverridesByModel.find(a => a[0].__tableName === tableName);
                            const dbValues = overrides ? GRTest.Mock.create(overrides[0], overrides[1])[1] : [];
                            console.log('SpreadsheetApp.getValues', tableName, dbValues);
                            return dbValues;
                        }
                    }),
                    getRange: (row, col) => ({
                        setValue: val => actualUpdates.push([GASton.UPDATE_TYPES.DB.UPDATE, tableName, row, col, val])
                    })
                })
            })
        };

        window[fnName]();

        const logAssertFail = (desc, expected, actual) => {
            console.error('expected:', expected);
            console.error('actual:', actual);
            throw `assertion failure: ${desc}`
        };
        if(expectedUpdates.length !== actualUpdates.length) {
            logAssertFail('different number of DB updates', expectedUpdates.length, actualUpdates.length);
        }
        expectedUpdates.forEach((expectedUpdate, i) => {
            expectedUpdate[1] = expectedUpdate[1].__tableName;
            if(JSON.stringify(expectedUpdate) !== JSON.stringify(actualUpdates[i])) {
                logAssertFail(`different DB update at index ${i}`, expectedUpdate, actualUpdates[i]);
            }
        });

        logBeginEnd('-');
    };

    fnWithTests();

    delete GRTest.it;
};
