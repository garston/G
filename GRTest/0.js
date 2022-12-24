GRTest = {};
GRTest.ACTIVE_USER_EMAIL = 'ACTIVE_USER_EMAIL';
GRTest.SPREADSHEET_NAME = 'SPREADSHEET_NAME';

GRTest.describeApp = (appName, queriesByName, fnWithDescribes) => {
    let testCount = 0;

    GASton.checkProdMode = str => {
        console.log(str);
        return true;
    };

    GRTest.describeFn = (fnName, fnWithTests) => {
        function assertEqualJson(expected, actual, desc) {
            if (!JSUtil.ObjectUtil.equal(actual, expected)) {
                assertFail(desc, expected, actual);
            }
        }

        function assertFail(desc, expected, actual) {
            console.error('expected:', expected);
            console.error('actual:  ', actual);
            throw `assertion failure: ${desc}`
        }

        const renderHtml = html => document.body.innerHTML = html;

        GRTest.it = (desc, dbRowsByModel, threadsByQuery, expectedUpdates, parameter, expectedTextContentsBySelector = {}) => {
            function logBeginEnd(c) {
                const dividerChars = JSUtil.ArrayUtil.range(38).map(() => c).join('');
                console.warn(dividerChars, appName, `${fnName}(`, parameter || '', ')', desc, `(${testCount})`, dividerChars);
            }
            testCount++;
            logBeginEnd('+');
            GASton.Database._cache = {};

            const gmailThreadsByQuery = {};
            Object.entries(threadsByQuery).forEach(([q, threads]) => {
                gmailThreadsByQuery[queriesByName[q] || q] = threads.map((msgs, threadIndex) => {
                    const thread = {
                        addLabel: label => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.ADD_LABEL, q, threadIndex, label]),
                        getFirstMessageSubject: () => msgs[0].getSubject(),
                        getMessages: () => msgs.map((m, msgIndex) => ({
                            getAttachments: () => [],
                            getDate: () => new Date(),
                            ...m,
                            getId: () => [q, threadIndex, msgIndex].join('_'),
                            getThread: () => thread,
                            markRead: () => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MARK_READ, q, threadIndex, msgIndex]),
                            reply: body => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY, q, threadIndex, msgIndex, body]),
                            replyAll: body => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY_ALL, q, threadIndex, msgIndex, body])
                        }))
                    };
                    return thread;
                });
            });

            const actualUpdates = [];
            window.ContentService = {createTextOutput: s => s};
            window.GmailApp = {
                getMessageById: id => {
                    console.log('GmailApp.getMessageById', id);
                    return Object.values(gmailThreadsByQuery).map(threads => threads.map(t => t.getMessages()).flat()).flat().find(msg => msg.getId() === id);
                },
                getUserLabelByName: label => label,
                search: q => {
                    const threads = gmailThreadsByQuery[q] || [];
                    console.log('GmailApp.search', q, threads.map(t => JSON.stringify(t.getMessages().map(m => m.getId()))));
                    return threads;
                }
            };
            window.MailApp = {
                sendEmail: (email, subject, body) => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.SEND, email, subject, body])
            };
            window.Session = {
                getActiveUser: () => ({
                    getEmail: () => GRTest.ACTIVE_USER_EMAIL
                })
            };
            window.SpreadsheetApp = {
                getActiveSpreadsheet: () => ({
                    getName: () => GRTest.SPREADSHEET_NAME,
                    getSheetByName: tableName => ({
                        appendRow: () => actualUpdates.push([GASton.UPDATE_TYPES.DB.INSERT, tableName]),
                        deleteRow: row => actualUpdates.push([GASton.UPDATE_TYPES.DB.DELETE, tableName, row]),
                        getDataRange: () => ({
                            getValues: () => {
                                const dbValues = dbRowsByModel.find(a => a[0].__tableName === tableName)?.[1] || [['']];
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

            renderHtml(window[fnName]({parameter}) || '');

            expectedUpdates = [
                ...(parameter ? GRTest.Util.expectedDbUpdatesNewRow(GASton.ExecutionLog, 1, [JSUtil.DateUtil.timeString(new Date()), JSON.stringify(parameter)]) : []),
                ...expectedUpdates
            ].map(a => a.map(u => u?.__tableName || u));
            if(expectedUpdates.length !== actualUpdates.length) {
                assertFail('different number of updates', expectedUpdates, actualUpdates);
            }
            expectedUpdates.forEach((expectedUpdate, i) => {
                assertEqualJson(expectedUpdate, actualUpdates[i], `different update at index ${i}`);
            });

            Object.entries(expectedTextContentsBySelector).forEach(([selector, expectedTextContents]) => {
                assertEqualJson(
                    expectedTextContents,
                    (selector ? Array.from(document.body.querySelectorAll(selector)) : [document.body]).map(el => el.textContent),
                    `different textContext for '${selector}'`
                );
            });

            renderHtml('');
            logBeginEnd('-');
        };

        fnWithTests();

        delete GRTest.it;
    };

    fnWithDescribes();

    delete GRTest.describeFn;
};
