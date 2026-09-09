namespace GRTest {
    export const ACTIVE_USER_EMAIL = 'ACTIVE_USER_EMAIL';
    export const SPREADSHEET_NAME = 'SPREADSHEET_NAME';

    export const describeApp = (
        appName: string,
        queriesByName: Record<string, string>,
        fnWithDescribes: (describeFn: (
            fn: (() => void) | ((e: GoogleAppsScript.Events.DoGet) => string),
            fnWithTests: (
                it: (
                    desc: string,
                    dbRowsByModel: [GASton.Database.RegisteredClass, GASton.Database.BoundInstancePropVal[][]][],
                    threadsByQuery: Record<string, GoogleAppsScript.Gmail.GmailMessage[][]>,
                    expectedUpdates: string[],
                    parameter: GoogleAppsScript.Events.DoGet['parameter'],
                    expectedTextContentsBySelector?: Record<string, string>
                    ) => void
                ) => void
            ) => void) => void
        ) => {
        let testCount = 0;

        GASton.checkProdMode = str => {
            console.log(str);
            return true;
        };

        fnWithDescribes((fn, fnWithTests) => {
            type AssertArray = (null | string)[];
            type AssertDesc = string;
            function assertEqualArrays(expected: AssertArray, actual: AssertArray, desc: AssertDesc) {
                expected = expected.map((u, i) => u === null ? actual[i] : u);
                if (!JSUtil.ObjectUtil.equal(actual, expected)) {
                    assertFail(desc, expected, actual);
                }
            }
            function assertFail(desc: AssertDesc, expected: AssertArray, actual: AssertArray) {
                console.error('expected:', expected);
                console.error('actual:  ', actual);
                throw `assertion failure: ${desc}`;
            }

            const renderHtml = (html: string) => document.body.innerHTML = html;
            fnWithTests((desc, dbRowsByModel, threadsByQuery, expectedUpdates, parameter, expectedTextContentsBySelector = {}) => {
                function logBeginEnd(c: string) {
                    const dividerChars = JSUtil.ArrayUtil.range(38).map(() => c).join('');
                    console.warn(dividerChars, appName, `${fn.name}(`, parameter || '', ')', desc, `(${testCount})`, dividerChars);
                }
                testCount++;
                logBeginEnd('+');
                GASton.Database._cache = {};

                const executeAndReturn = function<T>(fn: () => any, ret: T) {
                    fn();
                    return ret;
                };
                const gmailThreadsByQuery: Record<string, GoogleAppsScript.Gmail.GmailThread[]> = {};
                Object.entries(threadsByQuery).forEach(([q, threads]) => {
                    gmailThreadsByQuery[queriesByName[q] || q] = threads.map((msgs, threadIndex) => {
                        const thread = {
                            addLabel: label => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.ADD_LABEL, q, threadIndex, label.getName()]), thread),
                            getFirstMessageSubject: () => msgs[0].getSubject(),
                            getId: () => `${q}_${threadIndex}`,
                            getMessages: () => msgs.map((m, msgIndex) => {
                                const msg = {
                                    getAttachments: () => [],
                                    getDate: () => new Date(),
                                    isInTrash: () => false,
                                    isUnread: () => false,
                                    ...(m as Partial<GoogleAppsScript.Gmail.GmailMessage>),
                                    getId: () => `${thread.getId()}_${msgIndex}`,
                                    getThread: () => thread,
                                    markRead: () => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MARK_READ, q, threadIndex, msgIndex]), msg),
                                    moveToTrash: () => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, q, threadIndex, msgIndex]), msg),
                                    reply: body => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY, q, threadIndex, msgIndex, body]), msg),
                                    replyAll: body => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.REPLY_ALL, q, threadIndex, msgIndex, body]), msg)
                                } as GoogleAppsScript.Gmail.GmailMessage;
                                return msg;
                            }),
                            moveToTrash: () => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.MAIL.MOVE_TO_TRASH, q, threadIndex]), thread)
                        } as GoogleAppsScript.Gmail.GmailThread;
                        return thread;
                    });
                });
                const gmailThreads = Object.values(gmailThreadsByQuery).flat();

                const actualUpdates: any[][] = [];
                window.ContentService = {
                    createTextOutput: s => ({
                        getContent: () => s
                    })
                } as GoogleAppsScript.Content.ContentService;
                window.GmailApp = {
                    getMessageById: id => {
                        const m = gmailThreads.map(t => t.getMessages()).flat().find(msg => msg.getId() === id);
                        console.log('GmailApp.getMessageById', id, m);
                        return m!;
                    },
                    getThreadById: id => {
                        const t = gmailThreads.find(t => t.getId() === id);
                        console.log('GmailApp.getThreadById', id, t);
                        return t!;
                    },
                    getUserLabelByName: label => ({getName: () => label} as GoogleAppsScript.Gmail.GmailLabel),
                    search: q => {
                        const threads = gmailThreadsByQuery[q] || [];
                        console.log('GmailApp.search', q, threads.map(t => JSON.stringify(t.getMessages().map(m => m.getId()))));
                        return threads;
                    }
                } as GoogleAppsScript.Gmail.GmailApp;
                window.MailApp = {
                    sendEmail: (email, subject, body) => {
                        actualUpdates.push([GASton.UPDATE_TYPES.MAIL.SEND, email, subject, body]);
                    }
                } as GoogleAppsScript.Mail.MailApp;
                window.Session = {
                    getActiveUser: () => ({
                        getEmail: () => GRTest.ACTIVE_USER_EMAIL
                    })
                } as GoogleAppsScript.Base.Session;
                window.SpreadsheetApp = {
                    getActiveSpreadsheet: () => ({
                        getName: () => GRTest.SPREADSHEET_NAME,
                        getSheetByName: tableName => {
                            const sheet = {
                                appendRow: (_) => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.DB.INSERT, tableName]), sheet),
                                clear: () => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.DB.CLEAR, tableName]), sheet),
                                deleteRow: row => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.DB.DELETE, tableName, row]), sheet),
                                getDataRange: () => ({
                                    getValues: () => {
                                        const dbValues = dbRowsByModel.find(a => a[0].__tableName === tableName)?.[1] || [['']];
                                        console.log('SpreadsheetApp.getValues', tableName, dbValues);
                                        return dbValues;
                                    }
                                } as GoogleAppsScript.Spreadsheet.Range),
                                getRange: (row, col) => {
                                    const range = {
                                        setValue: val => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.DB.UPDATE, tableName, row, col, val]), range)
                                    } as GoogleAppsScript.Spreadsheet.Range;
                                    return range;
                                }
                            } as GoogleAppsScript.Spreadsheet.Sheet;
                            return sheet;
                        }
                    })
                } as GoogleAppsScript.Spreadsheet.SpreadsheetApp;
                window.UrlFetchApp = {
                    fetch: (url, params) => executeAndReturn(() => actualUpdates.push([GASton.UPDATE_TYPES.URL.FETCH, url, params]), {} as GoogleAppsScript.URL_Fetch.HTTPResponse)
                } as GoogleAppsScript.URL_Fetch.UrlFetchApp;

                renderHtml(fn({parameter} as GoogleAppsScript.Events.DoGet) || '');

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
            });

            delete GRTest.it;
        });

        delete GRTest.describeFn;
    };
}
