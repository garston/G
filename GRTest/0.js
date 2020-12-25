GRTest = {};

GRTest.describe = (fnName, fnWithTests) => {
    GRTest.it = (desc, dbValuesByModel, msgsByQuery, expectedDbSetValues) => {
        const logBeginEnd = c => console.warn(['', ` ${fnName} ${desc} `, ''].join(JSUtil.ArrayUtil.range(38).map(() => c).join('')));
        logBeginEnd('+');

        window.GmailApp = {
            search: q => {
                const msgs = msgsByQuery[q] || [];
                console.log('GmailApp.search', q, msgs);
                return msgs;
            }
        };

        const actualDbSetValues = [];
        window.SpreadsheetApp = {
            getActiveSpreadsheet: () => ({
                getName: () => 'SPREADSHEET_NAME',
                getSheetByName: tableName => ({
                    getDataRange: () => ({
                        getValues: () => {
                            const dbValues = (dbValuesByModel.find(a => a[0].__tableName === tableName) || [null, []])[1];
                            console.log('SpreadsheetApp.getValues', tableName, dbValues);
                            return dbValues;
                        }
                    }),
                    getRange: (row, col) => ({
                        setValue: val => {
                            const valInfo = [tableName, row, col, val];
                            console.log('SpreadsheetApp.setValue', valInfo);
                            actualDbSetValues.push(valInfo);
                        }
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
        if(expectedDbSetValues.length !== actualDbSetValues.length) {
            logAssertFail('different number of DB updates', expectedDbSetValues.length, actualDbSetValues.length);
        }
        expectedDbSetValues.forEach((expectedSetVal, i) => {
            expectedSetVal[0] = expectedSetVal[0].__tableName;
            if(JSON.stringify(expectedSetVal) !== JSON.stringify(actualDbSetValues[i])) {
                logAssertFail(`different DB update at index ${i}`, expectedSetVal, actualDbSetValues[i]);
            }
        });

        logBeginEnd('-');
    };

    fnWithTests();

    delete GRTest.it;
};
