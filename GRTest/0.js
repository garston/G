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
        function assertEqualArrays(expected, actual, desc) {
            expected = expected.map((u, i) => u === null ? actual[i] : u);
            if (!JSUtil.ObjectUtil.equal(actual, expected)) {
                assertFail(desc, expected, actual);
            }
        }

        function assertFail(desc, expected, actual) {
            console.error('expected:', expected);
            console.error('actual:  ', actual);
            throw `assertion failure: ${desc}`;
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
                        getId: () => `${q}_${threadIndex}`,
                        getMessages: () => msgs.map((m, msgIndex) => ({
                            getAttachments: () => [],
                            getDate: () => new Date(),
                            isInTrash: () => false,
                            isUnread: () => false,
                            ...m,
                            getId: () => `${thread.getId()}_${msgIndex}`,
                            getThread: () => thread,
                            markRead: () => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MARK_READ, q, threadIndex, msgIndex]),
                            moveToTrash: () => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, q, threadIndex, msgIndex]),
                            reply: body => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY, q, threadIndex, msgIndex, body]),
                            replyAll: body => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY_ALL, q, threadIndex, msgIndex, body])
                        })),
                        moveToTrash: () => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, q, threadIndex])
                    };
                    return thread;
                });
            });
            const gmailThreads = Object.values(gmailThreadsByQuery).flat();

            const actualUpdates = [];
            window.ContentService = {createTextOutput: s => s};
            window.GmailApp = {
                getMessageById: id => {
                    const m = gmailThreads.map(t => t.getMessages()).flat().find(msg => msg.getId() === id);
                    console.log('GmailApp.getMessageById', id, m);
                    return m;
                },
                getThreadById: id => {
                    const t = gmailThreads.find(t => t.getId() === id);
                    console.log('GmailApp.getThreadById', id, t);
                    return t;
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
                        clear: () => actualUpdates.push([GASton.UPDATE_TYPES.DB.CLEAR, tableName]),
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
            window.UrlFetchApp = {
                fetch: (url, params) => actualUpdates.push([GASton.UPDATE_TYPES.URL.FETCH, url, params])
            };

            renderHtml(window[fnName]({parameter}) || '');

            expectedUpdates = [
                ...(parameter ? GRTest.Util.expectedDbUpdatesNewRow(GASton.ExecutionLog, 1, [null, JSON.stringify(parameter)]) : []),
                ...expectedUpdates
            ].map(a => a.map(u => u?.__tableName || u));
            if(expectedUpdates.length !== actualUpdates.length) {
                assertFail('different number of updates', expectedUpdates, actualUpdates);
            }
            expectedUpdates.forEach((expectedUpdate, i) => {
                assertEqualArrays(expectedUpdate, actualUpdates[i], `different update at index ${i}`);
            });

            Object.entries(expectedTextContentsBySelector).forEach(([selector, expectedTextContents]) => {
                assertEqualArrays(
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
