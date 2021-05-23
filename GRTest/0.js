GRTest = {};
GRTest.SPREADSHEET_NAME = 'SPREADSHEET_NAME';

GRTest.describeApp = (appName, queryNames, fnWithDescribes) => {
    let testCount = 0;

    GASton.checkProdMode = str => {
        console.log(str);
        return true;
    };

    GRTest.describeFn = (fnName, fnWithTests) => {
        GRTest.it = (desc, dbRowsByModel, threadsByQuery, expectedUpdates) => {
            const logBeginEnd = c => console.warn(['', ` ${appName} ${fnName}() ${desc} (${testCount}) `, ''].join(JSUtil.ArrayUtil.range(38).map(() => c).join('')));
            testCount++;
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
                    getName: () => GRTest.SPREADSHEET_NAME,
                    getSheetByName: tableName => ({
                        appendRow: () => actualUpdates.push([GASton.UPDATE_TYPES.DB.INSERT, tableName]),
                        getDataRange: () => ({
                            getValues: () => {
                                const dbValues = dbRowsByModel.find(a => a[0].__tableName === tableName)[1];
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

            expectedUpdates = expectedUpdates.map(a => a.map(u => u.__tableName || u));
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
