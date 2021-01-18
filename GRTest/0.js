GRTest = {};

GRTest.describeApp = (appName, defaultValuesByModel, queryNames, fnWithDescribes) => {
    GASton.checkProdMode = str => {
        console.log(str);
        return true;
    };

    GRTest.describeFn = (fnName, fnWithTests) => {
        GRTest.it = (desc, dbRowsOfOverridesByModel, threadsByQuery, expectedUpdates) => {
            const logBeginEnd = c => console.warn(['', ` ${appName} ${fnName}() ${desc} `, ''].join(JSUtil.ArrayUtil.range(38).map(() => c).join('')));
            logBeginEnd('+');
            GASton.Database._cache = {};

            const actualUpdates = [];
            window.GmailApp = {
                getUserLabelByName: label => label,
                search: q => {
                    const queryName = queryNames[q];
                    const threads = (queryName && threadsByQuery[queryName]) || [];
                    console.log('GmailApp.search', q, threads);
                    return threads.map((msgs, threadIndex) => {
                        const thread = {
                            addLabel: label => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.ADD_LABEL, queryName, threadIndex, label]),
                            getFirstMessageSubject: () => msgs[0].getSubject(),
                            getMessages: () => msgs.map((m, msgIndex) => ({
                                getAttachments: () => [],
                                getDate: () => new Date(),
                                ...m,
                                getThread: () => thread,
                                markRead: () => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MARK_READ, queryName, threadIndex, msgIndex])
                            }))
                        };
                        return thread;
                    });
                }
            };
            window.MailApp = {
                sendEmail: (email, subject, body) => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.SEND, email, body])
            };
            window.Session = {
                getActiveUser: () => ({
                    getEmail: () => ''
                })
            };
            window.SpreadsheetApp = {
                getActiveSpreadsheet: () => ({
                    getName: () => 'SPREADSHEET_NAME',
                    getSheetByName: tableName => ({
                        appendRow: () => actualUpdates.push([GASton.UPDATE_TYPES.DB.INSERT, tableName]),
                        getDataRange: () => ({
                            getValues: () => {
                                const overrides = dbRowsOfOverridesByModel.find(a => a[0].__tableName === tableName);
                                const dbValues = overrides ? GRTest.Mock.create(overrides[0], defaultValuesByModel, overrides[1])[1] : [];
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

            expectedUpdates = expectedUpdates.map(u => [u[0], u[1].__tableName || u[1], ...u.slice(2)]);
            const logAssertFail = (desc, expected, actual) => {
                console.error('expected:', expected);
                console.error('actual:', actual);
                throw `assertion failure: ${desc}`
            };
            if(expectedUpdates.length !== actualUpdates.length) {
                logAssertFail('different number of updates', expectedUpdates, actualUpdates);
            }
            expectedUpdates.forEach((expectedUpdate, i) => {
                if(JSON.stringify(expectedUpdate) !== JSON.stringify(actualUpdates[i])) {
                    logAssertFail(`different update at index ${i}`, expectedUpdate, actualUpdates[i]);
                }
            });

            logBeginEnd('-');
        };

        fnWithTests();

        delete GRTest.it;
    };

    fnWithDescribes();

    delete GRTest.describeFn;
};
